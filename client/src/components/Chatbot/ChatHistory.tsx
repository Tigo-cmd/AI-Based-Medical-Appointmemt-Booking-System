// src/components/ChatHistory.tsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Bot, User, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';

interface ChatHistoryProps {
  onBack: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onBack }) => {
  const { state } = useApp();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!state.user?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/chat?userId=${state.user.id}`);
        const json = await res.json();
        const chats: ChatMessage[] = Array.isArray(json.history) ? json.history : [];
        // Sort newest first
        chats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistory(chats);
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [state.user?.id]);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
          <p className="text-gray-600 mt-2">Review your past conversations with the medical assistant</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : history.length > 0 ? (
          <div className="space-y-8">
            {history.map((chat) => (
              <div
                key={chat.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {new Date(chat.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* User Question */}
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-800">{chat.message}</p>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-800">{chat.response}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chat History</h3>
            <p className="text-gray-600 mb-6">
              You haven't had any conversations with the medical assistant yet. Start chatting to get health guidance.
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Start Your First Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
