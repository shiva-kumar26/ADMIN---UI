// KnowledgeBase.tsx (updated)
import React, { useState } from 'react';
import Chatbot from '../components/KnowledgeBase/Chatbot';
import DocumentUpload from '../components/KnowledgeBase/DocumentUpload';
import DocumentList from '../components/KnowledgeBase/DocumentList';
import { Search, MessageSquare, Info } from 'lucide-react';
import { isAdmin, getUserIdentifier, getUserRole } from '@/config';

export default function KnowledgeBase() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isAdminUser = isAdmin();

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">
          {isAdminUser ? (
            <span>👑 <strong className="font-semibold">Admin Mode</strong> - Your documents can be made accessible to all agents</span>
          ) : (
            <span>👤 <strong className="font-semibold">Agent Mode</strong> - View your documents and global knowledge</span>
          )}
        </p>
        <p className="text-xs text-gray-500">
          User: {getUserIdentifier()} | Role: {getUserRole()}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative w-1/3">
          <Search className="absolute left-2 top-2.5 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="pl-8 p-2 rounded border border-gray-300 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DocumentUpload />
      </div>

      <DocumentList searchTerm={searchTerm} />

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How it works:
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {isAdminUser ? (
            <>
              <li><strong>👑 As Admin:</strong> You can upload documents and mark them as "Global"</li>
              <li><strong>🌍 Global Documents:</strong> Will be accessible to ALL agents for their chatbot queries</li>
              <li><strong>🔒 Private Documents:</strong> Only you can access these documents</li>
              <li><strong>💡 Tip:</strong> Use global documents for company policies, product manuals, etc.</li>
            </>
          ) : (
            <>
              <li><strong>👤 Your Documents:</strong> Personal knowledge base for your queries</li>
              <li><strong>🌍 Global Documents:</strong> Company-wide knowledge uploaded by admins</li>
              <li><strong>🤖 Chatbot:</strong> Has access to both your documents and global documents</li>
              <li><strong>📝 Note:</strong> You cannot delete or modify global documents</li>
            </>
          )}
        </ul>
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {isChatOpen && (
        <div className="fixed top-0 right-0 h-full w-96 bg-gray-100 shadow-lg z-50">
          <Chatbot onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}