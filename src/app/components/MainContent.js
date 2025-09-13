"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UploadCloud, Sparkles, MessageSquare, Zap, Bot, FileAudio, Mic, Play, Pause, LogOut, User, ChevronDown } from "lucide-react";
import ActionItemDisplay from './ActionItemDisplay';
import { auth } from '../config/firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
  isLiveRecording,
  toggleLiveRecording,
  liveTranscript,
  livePoints,
  liveRunId
}) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const ok = window.confirm('Are you sure you want to sign out?');
    if (!ok) return;
    try {
      await signOut(auth);
      setUser(null);
      setShowUserMenu(false);
    } catch (err) {
      console.error('Logout failed', err);
      alert('Failed to logout. Try again.');
    }
  };

  const displayNameOrEmail = () => {
    if (!user) return '';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
              <Bot size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TalkToText Pro</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Smart meeting transcripts & insights</p>
            </div>
          </motion.div>

          {/* User Profile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            {authLoading ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full pl-2 pr-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayNameOrEmail())}&background=0D8ABC&color=fff`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{displayNameOrEmail()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{displayNameOrEmail()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-sm text-gray-500">
                Not signed in
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Live Recording Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleLiveRecording}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg font-medium transition-all ${
                isLiveRecording
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200 dark:shadow-red-900/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-200 dark:shadow-blue-900/30"
              }`}
            >
              {isLiveRecording ? (
                <>
                  <Pause size={18} />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic size={18} />
                  Start Live Recording
                </>
              )}
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {showUpload && (
              <motion.div
                key="upload-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Meeting Recording</h2>
                </div>

                <div 
                  className={`border-2 border-dashed ${
                    isDragging 
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  } rounded-xl p-8 text-center mb-6 transition-colors duration-300 cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports audio and video files (max 500MB)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 flex items-center gap-3"
                  >
                    <FileAudio size={20} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      Remove
                    </button>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Language
                  </label>
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={upload}
                    disabled={loading || !file}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2 shadow-md font-medium transition-all flex-1 justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Upload & Process
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {isLiveRecording && (
              <motion.div
                key="live-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Mic size={20} className="text-red-600 dark:text-red-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Meeting Transcription</h2>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-500" />
                    Live Transcript
                  </h3>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg min-h-[120px] max-h-60 overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {liveTranscript || "Listening for audio... Speak clearly into your microphone."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {livePoints.key_points && livePoints.key_points.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5">
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" />
                        Key Points
                      </h3>
                      <ul className="space-y-2">
                        {livePoints.key_points.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {livePoints.action_items && livePoints.action_items.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-green-500" />
                        Action Items
                      </h3>
                      <ActionItemDisplay actionItems={livePoints.action_items} />
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openChat({ run_id: liveRunId, filename: "Live Meeting", created_at: new Date() })}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-md w-full justify-center font-medium"
                >
                  <MessageSquare size={18} />
                  Chat about this meeting
                </motion.button>
              </motion.div>
            )}

            {!showUpload && !isLiveRecording && meetings.length > 0 && (
              <motion.div
                key="welcome-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
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
                  className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6"
                >
                  <Bot size={64} className="text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Welcome to TalkToText Pro
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Select a meeting from the sidebar to start chatting with your AI assistant, or upload a new meeting recording.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpload(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 px-6 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto font-medium"
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
                className="text-center py-16"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3
                  }}
                  className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-6"
                >
                  <FileAudio size={64} className="text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  No Meetings Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Upload your first meeting recording or start a live meeting to get started with TalkToText Pro. We ll transcribe, summarize, and help you analyze your meetings.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpload(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 px-6 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto font-medium"
                >
                  <UploadCloud size={18} />
                  Upload Your First Meeting
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-700 shadow-sm"
            >
              <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing Status
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {status.status ? `Status: ${status.status}` : "Processing your meeting..."}
                </p>
              </div>
              {status.status === "processing" && (
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="bg-blue-600 h-2 rounded-full"
                  ></motion.div>
                </div>
              )}
            </motion.div>
          )}

          {result && !isLiveRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Sparkles size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Processing Complete</h2>
              </div>

              <div className="space-y-6">
                {result.summary && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageSquare size={18} className="text-blue-500" />
                      Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      {result.summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.key_points && result.key_points.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5">
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" />
                        Key Points
                      </h3>
                      <ul className="space-y-2">
                        {result.key_points.map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.decisions && result.decisions.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5">
                      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-500" />
                        Decisions
                      </h3>
                      <ul className="space-y-2">
                        {result.decisions.map((decision, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{decision}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {result.action_items && result.action_items.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <Zap size={18} className="text-green-500" />
                      Action Items
                    </h3>
                    <ActionItemDisplay actionItems={result.action_items} />
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openChat({ run_id: runId, filename: file?.name, created_at: new Date() })}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-md w-full justify-center font-medium"
                >
                  <MessageSquare size={18} />
                  Chat about this meeting
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;