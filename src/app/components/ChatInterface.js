// components/ChatInterface.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, User, Bot, Calendar } from "lucide-react";
import ActionItemDisplay from './ActionItemDisplay'; // If needed, but in original it's not directly used here
import { useAuth } from './AuthProvider';

const ChatInterface = ({ meeting, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (meeting?.run_id) {
      loadMeetingData(meeting.run_id);
      loadConversations(meeting.run_id);
    }
  }, [meeting]);

  const loadMeetingData = async (runId) => {
    try {
      const res = await fetch(`http://localhost:8000/status/${runId}`);
      const data = await res.json();
      if (data.result) {
        setMeetingData(data.result);
        if (data.result.summary && messages.length === 0) {
          setMessages([{
            type: 'assistant',
            content: `I've processed your meeting. Here's a summary:\n\n${formatMeetingData(data.result)}`,
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error("Error loading meeting data:", error);
    }
  };

  const loadConversations = async (runId) => {
    try {
      if (!user) return;
      const res = await fetch(`http://localhost:8000/conversations/${runId}?user_id=${user.uid}`);
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        const formattedMessages = data.conversations.flatMap(conv => [
          { type: 'user', content: conv.message, timestamp: conv.timestamp },
          { type: 'assistant', content: conv.response, timestamp: conv.timestamp }
        ]);
        setMessages(prev => [...formattedMessages, ...prev]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const formatMeetingData = (data) => {
    if (!data) return "";

    let formatted = "";

    if (data.summary) {
      formatted += `SUMMARY:\n${data.summary}\n\n`;
    }

    if (data.key_points && data.key_points.length > 0) {
      formatted += "KEY POINTS:\n";
      data.key_points.forEach(point => {
        formatted += `• ${point}\n`;
      });
      formatted += "\n";
    }

    if (data.decisions && data.decisions.length > 0) {
      formatted += "DECISIONS:\n";
      data.decisions.forEach(decision => {
        formatted += `• ${decision}\n`;
      });
      formatted += "\n";
    }

    if (data.action_items && data.action_items.length > 0) {
      formatted += "ACTION ITEMS:\n";
      data.action_items.forEach(item => {
        if (typeof item === 'object') {
          formatted += `• ${item.owner}: ${item.task} (Due: ${item.due || 'No due date'})\n`;
        } else {
          formatted += `• ${item}\n`;
        }
      });
      formatted += "\n";
    }

    if (data.sentiment) {
      formatted += `SENTIMENT: ${data.sentiment}\n`;
    }

    return formatted.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;
    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/chat/${meeting.run_id}?user_id=${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      const assistantMessage = {
        type: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Karachi'
      });
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80">
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-gray-100/60 rounded-xl flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Meetings</span>
          </motion.button>
          <div>
            <h2 className="font-semibold text-lg text-gray-800 truncate max-w-[200px] sm:max-w-xs">
              {meeting.filename}
            </h2>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar size={14} />
              {new Date(meeting.created_at).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100/60 px-3 py-1.5 rounded-full">
          <MessageSquare size={16} />
          <span>Meeting Chat</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 mt-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4
              }}
              className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4"
            >
              <Bot size={48} className="text-blue-500" />
            </motion.div>
            <p>Processing your meeting... Please wait.</p>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3/4 rounded-2xl p-4 ${message.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white/90 backdrop-blur-sm shadow-sm'} max-w-xs sm:max-w-md md:max-w-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.type === 'user' ? (
                    <User size={16} className={message.type === 'user' ? 'text-blue-200' : 'text-blue-600'} />
                  ) : (
                    <Bot size={16} className={message.type === 'user' ? 'text-blue-200' : 'text-green-600'} />
                  )}
                  <span className={`text-xs ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-xs sm:max-w-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-green-600" />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this meeting..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl px-4 py-3 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2 shadow-md"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;