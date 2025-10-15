"use client";
import React from "react";

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [onClose]);

  if (!message) return null;
  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm rounded border border-red-200 bg-white p-3 shadow">
      <div className="flex items-start gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs">!</span>
        <div className="text-sm text-gray-900">
          {message}
        </div>
        <button aria-label="Close" className="ml-auto text-gray-500 hover:text-gray-900" onClick={onClose}>×</button>
      </div>
    </div>
  );
}


