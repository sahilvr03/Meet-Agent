// components/Sidebar.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Plus, History, FileAudio, MoreVertical, Trash2, Download, Edit } from "lucide-react";
import MeetingItem from './MeetingItem';

const Sidebar = ({ meetings, showUpload, setShowUpload, openChat, deleteMeeting, renameMeeting, downloadMeeting }) => {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 flex flex-col shadow-lg"
    >
      <div className="p-5 border-b border-gray-200/50">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
        >
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Mic size={20} className="text-white" />
          </div>
          TalkToText Pro
        </motion.h1>
        <p className="text-sm text-gray-600 mt-2">Your AI Meeting Assistant</p>
      </div>
      <div className="p-5 border-b border-gray-200/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(!showUpload)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl py-3 px-4 hover:from-blue-600 hover:to-purple-600 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          New Meeting
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <History size={18} />
            Your Meetings
          </h2>
          <span className="text-sm bg-gray-200/60 text-gray-700 px-2 py-1 rounded-full">
            {meetings.length}
          </span>
        </div>
        {meetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-8"
          >
            <FileAudio size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No meetings yet</p>
            <p className="text-sm">Upload your first meeting to get started</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting, index) => (
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
    </motion.div>
  );
};

export default Sidebar;