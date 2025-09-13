"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  User,
  Bot,
  ArrowLeft,
  Loader2,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatInterface = ({ meeting, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Load meeting data and conversation history
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
          setMessages([
            {
              type: "assistant",
              content: `I've processed your meeting. Here's a summary:\n\n${formatMeetingData(
                data.result
              )}`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error loading meeting data:", error);
    }
  };

  const loadConversations = async (runId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/conversations/${runId}?user_id=demo`
      );
      const data = await res.json();

      if (data.conversations?.length > 0) {
        const formattedMessages = data.conversations.flatMap((conv) => [
          { type: "user", content: conv.message, timestamp: conv.timestamp },
          { type: "assistant", content: conv.response, timestamp: conv.timestamp },
        ]);
        setMessages((prev) => [...formattedMessages, ...prev]);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const formatMeetingData = (data) => {
    if (!data) return "";

    let formatted = "";
    if (data.summary) formatted += `SUMMARY:\n${data.summary}\n\n`;

    if (data.key_points?.length > 0) {
      formatted += "KEY POINTS:\n";
      data.key_points.forEach((point) => (formatted += `• ${point}\n`));
      formatted += "\n";
    }

    if (data.decisions?.length > 0) {
      formatted += "DECISIONS:\n";
      data.decisions.forEach((decision) => (formatted += `• ${decision}\n`));
      formatted += "\n";
    }

    if (data.action_items?.length > 0) {
      formatted += "ACTION ITEMS:\n";
      data.action_items.forEach((item) => {
        formatted +=
          typeof item === "object"
            ? `• ${item.owner}: ${item.task} (Due: ${item.due})\n`
            : `• ${item}\n`;
      });
      formatted += "\n";
    }

    if (data.sentiment) formatted += `SENTIMENT: ${data.sentiment}\n`;
    return formatted;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/chat/${meeting.run_id}?user_id=demo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await res.json();
      const assistantMessage = {
        type: "assistant",
        content: data.response,
        timestamp: data.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleTimeString("en-PK", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isBottom =
        container.scrollHeight - container.scrollTop === container.clientHeight;
      setShowScrollButton(!isBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-xl border-b border-gray-700 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <h2 className="font-bold text-lg">{meeting.filename}</h2>
            <p className="text-sm text-gray-400">
              {new Date(meeting.created_at).toLocaleDateString("en-PK")}
            </p>
          </div>
        </div>
        <FileText className="text-blue-400" size={20} />
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="text-center mt-10">
            <Bot
              size={64}
              className="mx-auto mb-4 text-gray-500 animate-pulse"
            />
            <p className="text-gray-400">Processing your meeting...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                  {message.type === "user" ? (
                    <User size={14} />
                  ) : (
                    <Bot size={14} className="text-green-400" />
                  )}
                  <span>{formatTime(message.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 animate-pulse">
            <Loader2 className="animate-spin" size={16} />
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 right-6 bg-blue-500 p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            <ChevronDown size={20} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-xl p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this meeting..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white flex items-center gap-2 disabled:bg-gray-600 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
