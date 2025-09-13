// components/MainContent.js
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UploadCloud, Sparkles, MessageSquare, Zap, Bot, FileAudio, Mic, Play, Pause } from "lucide-react";
import ActionItemDisplay from './ActionItemDisplay';

const MainContent = ({
  file,
  setFile,
  selectedLanguage,
  setSelectedLanguage,
  status,
  result,
  loading,
  showUpload,
  isDragging,
  setShowUpload,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  upload,
  openChat,
  runId,
  meetings,
  languageOptions,
  isLiveRecording, // New prop
  toggleLiveRecording, // New prop
  liveTranscript, // New prop
  livePoints, // New prop
  liveRunId // New prop
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Live Recording Button */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLiveRecording}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 shadow-md ${
              isLiveRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            }`}
          >
            {isLiveRecording ? (
              <>
                <Pause size={18} />
                Stop Live Recording
              </>
            ) : (
              <>
                <Mic size={18} />
                Start Live Recording
              </>
            )}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {showUpload && (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`border-2 ${
                  isDragging ? "border-dashed border-blue-400" : "border-gray-200/50"
                } rounded-2xl p-6 bg-white/80 backdrop-blur-sm shadow-md mb-6 transition-colors duration-300`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                  </div>
                  Upload Meeting Recording
                </h2>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Select an audio or video file
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="file-upload"
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-gray-600 p-2 border rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select meeting language
                  </label>
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="block w-full p-2 border rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200/50 flex items-center gap-3"
                  >
                    <FileAudio size={16} className="text-blue-600" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="ml-auto text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </motion.div>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={upload}
                    disabled={loading || !file}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Upload & Process
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-blue-200 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-inner mb-6"
                >
                  <h2 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Processing Status
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-sm text-blue-700">
                      {status.status ? `Status: ${status.status}` : "Processing your meeting..."}
                    </p>
                  </div>
                  {status.status === "processing" && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
          {isLiveRecording && (
            <motion.div
              key="live-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border border-blue-200 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-inner mb-6">
                <h2 className="font-semibold text-blue-800 mb-4 flex items-center gap-2 text-lg">
                  <Mic size={16} className="text-blue-600 animate-pulse" />
                  Live Meeting Transcription
                </h2>
                <div className="bg-white/80 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-500" />
                    Live Transcript:
                  </h3>
                  <p className="text-gray-700 mb-5 p-3 bg-blue-50/50 rounded-lg min-h-[100px]">{liveTranscript || "Listening..."}</p>
                  {livePoints.key_points && livePoints.key_points.length > 0 && (
                    <>
                      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" />
                        Key Points:
                      </h3>
                      <ul className="text-gray-700 mb-5 space-y-2">
                        {livePoints.key_points.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 p-3 bg-yellow-50/50 rounded-lg"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div>
                            <span>{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </>
                  )}
                  {livePoints.action_items && livePoints.action_items.length > 0 && (
                    <>
                      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Zap size={16} className="text-green-500" />
                        Action Items:
                      </h3>
                      <ActionItemDisplay actionItems={livePoints.action_items} />
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openChat({ run_id: liveRunId, filename: "Live Meeting", created_at: new Date() })}
                    className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-600 flex items-center gap-2 shadow-md w-full justify-center"
                  >
                    <MessageSquare size={16} />
                    Chat about this meeting
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          {!showUpload && !isLiveRecording && meetings.length > 0 && (
            <motion.div
              key="welcome-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
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
                className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6"
              >
                <Bot size={64} className="text-blue-500" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Welcome to TalkToText Pro
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Select a meeting from the sidebar to start chatting with your AI assistant, or upload a new meeting recording.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl py-3 px-6 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <UploadCloud size={18} />
                Upload New Meeting
              </motion.button>
            </motion.div>
          )}
          {!showUpload && !isLiveRecording && meetings.length === 0 && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3
                }}
                className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-6"
              >
                <FileAudio size={64} className="text-blue-400" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                No Meetings Yet
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Upload your first meeting recording or start a live meeting to get started with TalkToText Pro. Well transcribe, summarize, and help you analyze your meetings.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl py-3 px-6 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
              >
                <UploadCloud size={18} />
                Upload Your First Meeting
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        {result && !isLiveRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md mb-6"
          >
            <h2 className="font-semibold text-green-800 mb-4 flex items-center gap-2 text-lg">
              <div className="p-1 bg-green-100 rounded-full">
                <Sparkles size={16} className="text-green-600" />
              </div>
              Processing Complete
            </h2>
            <div className="bg-white/80 rounded-xl p-5 shadow-sm">
              {result.summary && (
                <>
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-500" />
                    Summary:
                  </h3>
                  <p className="text-gray-700 mb-5 p-3 bg-blue-50/50 rounded-lg">{result.summary}</p>
                </>
              )}
              {result.key_points && result.key_points.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    Key Points:
                  </h3>
                  <ul className="text-gray-700 mb-5 space-y-2">
                    {result.key_points.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-3 bg-yellow-50/50 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div>
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
              {result.decisions && result.decisions.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    Decisions:
                  </h3>
                  <ul className="text-gray-700 mb-5 space-y-2">
                    {result.decisions.map((decision, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2 p-3 bg-purple-50/50 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span>{decision}</span>
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
              {result.action_items && result.action_items.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <Zap size={16} className="text-green-500" />
                    Action Items:
                  </h3>
                  <ActionItemDisplay actionItems={result.action_items} />
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openChat({ run_id: runId, filename: file?.name, created_at: new Date() })}
                className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-600 flex items-center gap-2 shadow-md w-full justify-center"
              >
                <MessageSquare size={16} />
                Chat about this meeting
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MainContent;