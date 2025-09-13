"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileAudio, MoreVertical, Edit, Trash2, FileText, FileSpreadsheet } from "lucide-react";

const MeetingItem = ({ meeting, onClick, deleteMeeting, renameMeeting, downloadMeeting }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(meeting.filename);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (!newName.trim()) {
      alert("Meeting name cannot be empty");
      return;
    }
    renameMeeting(meeting.run_id, newName);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200/50 relative">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 p-2 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleRename()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRename}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(false)}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onClick(meeting)}
          >
            <FileAudio size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-800 truncate max-w-[180px]">
                {meeting.filename}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(meeting.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={16} /> Rename
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${meeting.filename}"?`)) {
                      deleteMeeting(meeting.run_id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    downloadMeeting(meeting.run_id, "word");
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText size={16} /> Download Word
                </button>
                <button
                  onClick={() => {
                    downloadMeeting(meeting.run_id, "csv");
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileSpreadsheet size={16} /> Download CSV
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingItem;