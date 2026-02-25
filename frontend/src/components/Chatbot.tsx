import React, { useState, useEffect } from 'react';
import { chat, workspaces } from '../api';

interface Workspace {
  id: number;
  name: string;
}

interface ChatbotProps {
  workspaceId: number | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ workspaceId: initialWorkspaceId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(initialWorkspaceId);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadHistory();
    } else {
      setMessages([]);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaces.getAll();
      setWorkspaceList(response.data);
      if (response.data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const loadHistory = async () => {
    if (!selectedWorkspace) return;
    try {
      const response = await chat.getHistory(selectedWorkspace);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const clearChat = async () => {
    if (!selectedWorkspace) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear all chat history for this workspace? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await chat.clearHistory(selectedWorkspace);
      setMessages([]);
      alert('Chat history cleared successfully!');
    } catch (err) {
      console.error('Failed to clear chat history', err);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const formatResponse = (text: string) => {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const sendMessage = async () => {
    if (!input || !selectedWorkspace) return;
    setLoading(true);
    try {
      const response = await chat.send(selectedWorkspace, input);
      setMessages([...messages, { message: input, response: response.data.response }]);
      setInput('');
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message. Make sure you have papers in this workspace.');
    }
    setLoading(false);
  };

  const getWorkspaceName = () => {
    const workspace = workspaceList.find((ws) => ws.id === selectedWorkspace);
    return workspace ? workspace.name : 'Select Workspace';
  };

  if (workspaceList.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-8 max-w-md mx-auto shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Workspaces Found</h3>
          <p className="text-slate-600 mb-4">Create a workspace first to start chatting with AI.</p>
          <p className="text-sm text-blue-700">Go to Workspaces tab → Create a new workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-screen">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">AI Research Assistant</h2>
            <p className="text-slate-600 mt-1">Ask questions based on papers saved in your workspace</p>
          </div>

          {selectedWorkspace && messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-5 py-2.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 transition-all shadow-sm w-fit"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Workspace Selector */}
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-4 shadow-md">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Workspace
          </label>
          <select
            value={selectedWorkspace || ''}
            onChange={(e) => setSelectedWorkspace(Number(e.target.value))}
            className="w-full p-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {workspaceList.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>

          <p className="text-sm text-slate-500 mt-2">
            Chatting in:{' '}
            <span className="font-semibold text-blue-700">{getWorkspaceName()}</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white/80 backdrop-blur p-4 rounded-3xl border border-slate-200 shadow-md">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="mb-2 text-slate-700 font-medium">No messages yet.</p>
            <p className="text-sm">Import papers to this workspace, then ask questions here.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              {/* User bubble */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <p className="font-semibold text-blue-900 mb-1">You</p>
                <p className="text-slate-900">{msg.message}</p>
              </div>

              {/* AI bubble */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                <p className="font-semibold text-indigo-700 mb-2">AI Assistant</p>
                <div
                  className="text-slate-800 whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatResponse(msg.response) }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl p-3 shadow-md">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Ask about your research papers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-3 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={loading || !selectedWorkspace}
          />
          <button
            onClick={sendMessage}
            className="px-8 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !input || !selectedWorkspace}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {!selectedWorkspace && (
          <p className="text-sm text-red-600 mt-2">Please select a workspace to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chatbot;