import React, { useState, useEffect, useRef } from 'react';
import { kbApi } from '../../config';
import {
  MessageSquare, Upload, X, FileText, Phone, Send as SendIcon,
  Book, ClipboardList, MapPin, Clock, Lightbulb,
  Scale, List, Info, AlertCircle, Briefcase, Activity,
  Code, BarChart, Target
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { KBAuthSession } from '@/config';  // <-- NEW IMPORT: For KB auth sync

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  files?: FilePreview[];
  confidence?: number;
  relevantDocs?: number;
  processingTime?: number;
}

interface FilePreview {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

const Chatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ==================== SYNC KB SESSION ON MOUNT ====================
  useEffect(() => {
    KBAuthSession.syncFromMainAuth();
  }, []);
  // =================================================================

  /* ---------- Icon map (matches backend intros) ---------- */
  const iconMap: Record<string, React.ReactNode> = {
    'Definition:': <Book className="w-4 h-4" />,
    "Here's the process:": <ClipboardList className="w-4 h-4" />,
    'Location information:': <MapPin className="w-4 h-4" />,
    'Timeline:': <Clock className="w-4 h-4" />,
    'Reasoning:': <Lightbulb className="w-4 h-4" />,
    'Comparison:': <Scale className="w-4 h-4" />,
    'Key points:': <List className="w-4 h-4" />,
    'Based on your documents:': <Info className="w-4 h-4" />,
    'I couldn\'t find': <AlertCircle className="w-4 h-4" />
  };

  /* ---------- Inline bold parser helper ---------- */
  const parseInlineBold = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  /* ---------- Welcome messages ---------- */
  useEffect(() => {
    const welcome1: Message = {
      id: 1,
      text: "👋 **Welcome to Zenius IT Services!** I'm here to help you learn about our AI-powered solutions and services.",
      sender: 'bot'
    };
    const welcome2: Message = {
      id: 2,
      text: "**💼 We specialize in:**\n\n• AI & Machine Learning Solutions\n• Healthcare AI (HealthAI)\n• Contact Center Solutions (VoiceIQ)\n• Full-Stack Development\n• CRM Integrations\n• Automation & RPA",
      sender: 'bot'
    };
    setMessages([welcome1, welcome2]);
  }, []);

  /* ---------- Auto-scroll ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------- File handling ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: `${file.name} exceeds 10 MB`, variant: 'destructive' });
        return;
      }
      const fp: FilePreview = { file, type: file.type.startsWith('image/') ? 'image' : 'document' };
      if (fp.type === 'image') {
        const r = new FileReader();
        r.onload = ev => {
          fp.preview = ev.target?.result as string;
          setSelectedFiles(p => [...p, fp]);
        };
        r.readAsDataURL(file);
      } else {
        setSelectedFiles(p => [...p, fp]);
      }
    });
    e.target.value = '';
  };

  const removeFile = (i: number) => setSelectedFiles(p => p.filter((_, idx) => idx !== i));

  /* ---------- Quick buttons ---------- */
  const handleQuick = (label: string) => {
    const txt = label === 'Contact Us' ? 'How can I contact Zenius?' : `Tell me about ${label}`;
    setInput(txt);
    setTimeout(handleSendMessage, 80);
  };

  /* ---------- Send message ---------- */
  const handleSendMessage = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input || '(Files attached)',
      sender: 'user',
      files: [...selectedFiles]
    };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setSelectedFiles([]);

    await sendToBackend(userMsg);
  };

  const sendToBackend = async (userMsg: Message) => {
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('message', userMsg.text);
      userMsg.files?.forEach(f => fd.append('files', f.file));

      const res = await kbApi.post('/chat', fd, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const botMsg: Message = {
        id: Date.now() + 1,
        text: res.data.response,
        sender: 'bot',
        confidence: res.data.confidence,
        relevantDocs: res.data.sources_used,
        processingTime: res.data.processing_time_ms
      };
      setMessages(p => [...p, botMsg]);

      if (res.data.uploaded_files > 0) {
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        toast({ title: 'Files Uploaded', description: `${res.data.uploaded_files} file(s) added` });
      }
    } catch (error) {
      console.error('API Error:', error);
      setMessages(p => [...p, {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      }]);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- ENHANCED RESPONSE PARSER ---------- */
  const formatBotMessage = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];

    let inList = false;
    let listType: 'bullet' | 'numbered' | null = null;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Empty line → paragraph break
      if (!trimmed) {
        inList = false;
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // ---------- Main Heading with ** and emoji ----------
      const boldHeading = trimmed.match(/^([👋💼🏥📞🤖💻📊🎯🔧⚡🌟✨🚀📈💡🛠️🔍📋]?)\s*\*\*(.*?)\*\*:?\s*(.*)/);
      if (boldHeading) {
        const emoji = boldHeading[1];
        const heading = boldHeading[2];
        const rest = boldHeading[3];
        elements.push(
          <div key={idx} className="flex items-center gap-2 mt-4 mb-2">
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : (
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <span className="font-bold text-gray-900 text-base">{heading}</span>
              {rest && <span className="text-gray-700 ml-1">{rest}</span>}
            </div>
          </div>
        );
        inList = false;
        return;
      }

      // ---------- Subheading with emoji or icon ----------
      const iconMatch = Object.entries(iconMap).find(([key]) => trimmed.startsWith(key));
      if (iconMatch) {
        const [key, icon] = iconMatch;
        const rest = trimmed.slice(key.length).trim();
        elements.push(
          <div key={idx} className="flex items-center gap-2 font-semibold text-blue-700 mt-3 mb-2">
            {icon}
            <span>{rest || key}</span>
          </div>
        );
        inList = false;
        return;
      }

      // ---------- Bullet list ----------
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const content = trimmed.slice(2).trim();
        elements.push(
          <div key={idx} className="flex items-start gap-3 ml-4">
            <div className="min-w-[8px] h-2 bg-blue-500 rounded-full mt-2 shadow-sm" />
            <span className="text-gray-800 leading-relaxed flex-1">{parseInlineBold(content)}</span>
          </div>
        );
        inList = true;
        listType = 'bullet';
        return;
      }

      // ---------- Numbered list ----------
      const numbered = trimmed.match(/^(\d+\.)\s*(.*)/);
      if (numbered) {
        const num = numbered[1];
        const content = numbered[2];
        elements.push(
          <div key={idx} className="flex items-start gap-3 ml-4">
            <span className="font-medium text-blue-600 min-w-[20px]">{num}</span>
            <span className="text-gray-800 leading-relaxed flex-1">{parseInlineBold(content)}</span>
          </div>
        );
        inList = true;
        listType = 'numbered';
        return;
      }

      // ---------- Sub-bullets (indented) ----------
      if (trimmed.startsWith('  - ') || trimmed.startsWith('    • ')) {
        const content = trimmed.trim().slice(2).trim();
        elements.push(
          <div key={idx} className="flex items-start gap-3 ml-8">
            <div className="min-w-[6px] h-1.5 bg-gray-400 rounded-full mt-2" />
            <span className="text-gray-700 text-sm leading-relaxed flex-1">{parseInlineBold(content)}</span>
          </div>
        );
        return;
      }

      // ---------- Key-value pairs (e.g., "Feature: Description") ----------
      const keyValue = trimmed.match(/^(.*?):\s*(.*)/);
      if (keyValue && !trimmed.startsWith('http')) {
        const key = keyValue[1];
        const value = keyValue[2];
        elements.push(
          <div key={idx} className="flex items-start gap-2 mt-1">
            <strong className="font-semibold text-gray-900 min-w-[120px]">{key}:</strong>
            <span className="text-gray-800 leading-relaxed flex-1">{parseInlineBold(value)}</span>
          </div>
        );
        return;
      }

      // ---------- Links ----------
      if (trimmed.startsWith('http')) {
        elements.push(
          <a key={idx} href={trimmed} target="_blank" rel="noopener noreferrer"
             className="text-blue-600 hover:underline break-all">
            {trimmed}
          </a>
        );
        return;
      }

      // ---------- Subheadings without icon ----------
      const subHeadingMatch = trimmed.match(/^\*\*(.*?)\*\*:\s*(.*)/);
      if (subHeadingMatch) {
        const subHeading = subHeadingMatch[1];
        const description = subHeadingMatch[2];
        elements.push(
          <div key={idx} className="flex items-start gap-3 mt-2">
            <div className="min-w-[8px] h-2 bg-blue-500 rounded-full mt-2 shadow-sm" />
            <span className="text-gray-800 leading-relaxed flex-1">
              <strong className="font-semibold text-gray-900">{subHeading}:</strong> {description}
            </span>
          </div>
        );
        inList = true;
        listType = 'bullet';
        return;
      }

      // ---------- Default paragraph ----------
      inList = false;
      elements.push(<p key={idx} className="mt-1 text-gray-800 leading-relaxed">{trimmed}</p>);
    });

    return <div className="leading-relaxed">{elements}</div>;
  };

  /* ---------- Render ---------- */
  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Zenius Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-xs px-4 py-3 rounded-2xl shadow-sm text-sm
              ${m.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
              }
            `}>
              {/* Files */}
              {m.files?.length ? (
                <div className="mb-3 space-y-2">
                  {m.files.map((f, i) => f.type === 'image' && f.preview ? (
                    <img key={i} src={f.preview} alt={f.file.name}
                         className="max-w-full h-32 object-cover rounded-lg"/>
                  ) : (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg text-xs">
                      <FileText className="w-4 h-4 text-gray-600"/>
                      <span className="truncate">{f.file.name}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Message text */}
              {m.sender === 'bot' ? formatBotMessage(m.text) : (
                <div className="whitespace-pre-wrap">{m.text}</div>
              )}

              {/* Meta */}
              {m.sender === 'bot' && m.confidence !== undefined && (
                <div className="mt-3 pt-2 border-t border-gray-300 text-xs opacity-70">
                  <div className="flex justify-between text-gray-600">
                    <span>Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                    {m.processingTime && <span>{m.processingTime} ms</span>}
                  </div>
                  {m.relevantDocs !== undefined && m.relevantDocs > 0 && (
                    <div className="mt-1">Used {m.relevantDocs} document(s)</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"/>
                <span className="text-sm text-gray-600">Thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick buttons */}
      <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-gray-100">
        {['Our Services', 'HealthAI', 'VoiceIQ', 'Contact Us'].map(l => (
          <button
            key={l}
            onClick={() => handleQuick(l)}
            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition font-medium"
          >
            {l}
          </button>
        ))}
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pb-2 max-h-24 overflow-y-auto flex flex-wrap gap-2 bg-white">
          {selectedFiles.map((f, i) => (
            <div key={i} className="relative group">
              {f.type === 'image' && f.preview ? (
                <div className="relative">
                  <img src={f.preview} alt="" className="w-16 h-16 object-cover rounded-lg border"/>
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                  <FileText className="w-3 h-3"/>
                  <span className="truncate max-w-20">{f.file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-red-500">
                    <X className="w-3 h-3"/>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input + send */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="zenius-file"
            disabled={isLoading}
          />
          <label
            htmlFor="zenius-file"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
          >
            <Upload className="w-5 h-5 text-gray-600"/>
          </label>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            <SendIcon className="w-5 h-5"/>
          </button>
        </div>

        {/* Contact numbers */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3"/>
            <span>Call us:</span>
          </div>
          <a href="tel:+14084574613" className="hover:text-blue-600 transition">+1 408 457 4613</a>
          <span>|</span>
          <a href="tel:+919985491021" className="hover:text-blue-600 transition">+91 99854 91021</a>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;