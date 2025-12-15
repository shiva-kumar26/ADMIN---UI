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
    <div className="space-y-8 p-6 mt-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">
            User: {getUserIdentifier()} | Role: {getUserRole()}
          </p>
        </div>
        <DocumentUpload />
      </div>

      {/* <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">
              {isAdminUser ? 'Admin Mode: Manage Global Knowledge' : 'Agent Mode: Personal & Global Knowledge'}
            </p>
            <div className="space-y-1 text-blue-800/80">
              {isAdminUser ? (
                <>
                  <p>• Upload documents and mark them as <strong>"Global"</strong> to make them accessible to all agents.</p>
                  <p>• Private documents are only visible to you.</p>
                </>
              ) : (
                <>
                  <p>• <strong>Your Documents:</strong> Private to you.</p>
                  <p>• <strong>Global Documents:</strong> Shared by admins.</p>
                  <p>• Chatbot uses both for context.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div> */}

      <div className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
        {/* Search Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="pl-10 pr-4 py-3 rounded-xl bg-white w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        <DocumentList searchTerm={searchTerm} />
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isChatOpen && (
        <Chatbot onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}