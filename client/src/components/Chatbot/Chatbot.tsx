// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Bot as BotIcon, 
  User as UserIcon, 
  MessageCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';

interface ChatbotProps {
  onBack: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useApp();

  // Scroll down on new messages or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat, isTyping]);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!state.user?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/chat?userId=${state.user.id}`);
        const json = await res.json();
        const history: ChatMessage[] = Array.isArray(json.history) ? json.history : [];
        // Sort ascending for display
        history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setCurrentChat(history);
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, [state.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !state.user) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    // Temporary entry so UI shows it immediately
    const tempEntry: ChatMessage = {
      id: `temp-${Date.now()}`,
      userId: state.user.id,
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString(),
    };
    setCurrentChat(prev => [...prev, tempEntry]);

    try {
      const res = await fetch('https://emmanueltigo.pythonanywhere.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.user.id, message: userMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chatbot error');

      // Update the temp entry with the real response & timestamp
      setCurrentChat(prev =>
        prev.map(msg =>
          msg.id === tempEntry.id
            ? { ...msg, response: data.response, timestamp: data.timestamp }
            : msg
        )
      );

      // Persist in global state
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: {
          id: data.id || `resp-${Date.now()}`,
          userId: state.user.id,
          message: userMessage,
          response: data.response,
          timestamp: data.timestamp,
        } as ChatMessage,
      });
    } catch (err: any) {
      console.error('Chat API error:', err);
      setCurrentChat(prev =>
        prev.map(msg =>
          msg.id === tempEntry.id
            ? { ...msg, response: 'Sorry, something went wrong.' }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Medical Assistant Bot</h1>
              <p className="text-green-100">Get instant medical guidance and health information</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 bg-gray-50">
          {currentChat.length === 0 && !isTyping && (
            <div className="text-center py-12">
              <BotIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hello! I'm your Medical Assistant</h3>
              <p className="text-gray-600">
                I can help you understand symptoms and provide general health guidance.
                Ask me about any health concerns!
              </p>
            </div>
          )}

          {currentChat.map(chat => (
            <div key={chat.id} className="space-y-4 mb-6">
              {/* User */}
              <div className="flex justify-end">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm">
                    <p>{chat.message}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Bot */}
              {chat.response && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <BotIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                      <p className="text-gray-800">{chat.response}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(chat.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <BotIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your symptoms or ask a health question..."
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!message.trim() || isTyping}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <strong>Disclaimer:</strong> This chatbot provides general health information only and is not a substitute for professional medical advice.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
