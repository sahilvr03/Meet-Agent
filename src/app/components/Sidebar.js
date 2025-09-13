"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Plus, History, FileAudio, MoreVertical, Trash2, Download, Edit, ChevronDown, Search, X } from "lucide-react";
import MeetingItem from './MeetingItem';

const Sidebar = ({ meetings, showUpload, setShowUpload, openChat, deleteMeeting, renameMeeting, downloadMeeting }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(meeting => 
    meeting.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort meetings based on selected criteria
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "oldest") {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === "name") {
      return a.filename.localeCompare(b.filename);
    }
    return 0;
  });

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
            <Mic size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TalkToText Pro</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your AI Meeting Assistant</p>
          </div>
        </motion.div>
      </div>

      {/* New Meeting Button */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(!showUpload)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 px-4 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all font-medium"
        >
          <Plus size={18} />
          New Meeting
        </motion.button>
      </div>

      {/* Search and Sort */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sortBy === "newest" && "Newest first"}
              {sortBy === "oldest" && "Oldest first"}
              {sortBy === "name" && "By name"}
              <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
                >
                  <button
                    onClick={() => {
                      setSortBy("newest");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      sortBy === "newest" 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Newest first
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("oldest");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      sortBy === "oldest" 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Oldest first
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      sortBy === "name" 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    By name
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <History size={18} />
            Your Meetings
          </h2>
          <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
            {sortedMeetings.length} of {meetings.length}
          </span>
        </div>

        {sortedMeetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 dark:text-gray-400 py-8"
          >
            {searchQuery ? (
              <>
                <FileAudio size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No meetings found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <FileAudio size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No meetings yet</p>
                <p className="text-sm mt-1">Upload your first meeting to get started</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.run_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MeetingItem
                  meeting={meeting}
                  onClick={openChat}
                  deleteMeeting={deleteMeeting}
                  renameMeeting={renameMeeting}
                  downloadMeeting={downloadMeeting}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} stored
        </p>
      </div>
    </motion.div>
  );
};

export default Sidebar;