import React from 'react';
import { X, Search } from "lucide-react";

// This is now a simple "dumb" component. It has NO API call.
// It only knows how to display the 'data' it receives.
export default function LegalReferenceJournal({ data, onClose }) {
  // If no data is passed, don't show anything.
  if (!data) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-gray-700 p-6 rounded-2xl shadow-2xl max-w-2xl w-full text-white border-2 border-yellow-400">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-500">
          <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
            <Search size={22} />
            Legal Reference Journal
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <p className="mb-4 text-gray-300">
            Displaying information for: <em className="font-semibold text-white">{data.caseName}</em>
          </p>
          <div className="border-b border-gray-600 pb-4">
            <h3 className="text-lg text-blue-300">{data.caseName}</h3>
            <p className="text-gray-200 mt-2">{data.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
