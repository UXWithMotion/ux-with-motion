import React from "react";
import { motion } from "framer-motion";

export function FigmaDesignComponent() {
  return (
    <motion.div
      className="flex items-center justify-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">Figma Component Placeholder</h3>
        <p className="text-neutral-400 max-w-sm">
          The Figma MCP server was unreachable locally, so the design could not be extracted automatically. Please replace this with the actual exported design.
        </p>
      </div>
    </motion.div>
  );
}

