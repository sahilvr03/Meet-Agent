// components/ActionItemDisplay.js
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, User, Calendar } from "lucide-react";

const ActionItemDisplay = ({ actionItems }) => {
  if (!actionItems || actionItems.length === 0) {
    return (
      <div className="bg-gray-100/50 rounded-lg p-4 text-center text-gray-500">
        No action items found
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {actionItems.map((item, index) => {
        if (typeof item === 'object') {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-gray-200/50"
            >
              <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                <Zap size={12} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.task}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <User size={12} />
                  <span>{item.owner}</span>
                  {item.due && item.due !== "No due date" && (
                    <>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <Calendar size={12} />
                      <span>Due: {item.due}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        } else {
          return (
            <div key={index} className="flex items-center gap-2 p-3 bg-white/80 rounded-lg border border-gray-200/50">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Zap size={12} className="text-purple-600" />
              </div>
              <span className="text-sm text-gray-800">{item}</span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ActionItemDisplay;