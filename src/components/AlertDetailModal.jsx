import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

// This is a simple markdown parser to handle bold text (**text**)
function SimpleMarkdown({ text }) {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

export default function AlertDetailModal({ alert, onClose }) {
  if (!alert) return null;

  const getStatusPill = (type) => {
    switch (type) {
      case 'Immediate Action Required':
        return <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-200 rounded-full">{type}</span>;
      default:
        return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      {/* CHANGED: Main modal background and border */}
      <div className="bg-[#4B5C64] p-6 rounded-2xl shadow-2xl max-w-3xl w-full border-t-8 border-[#faecc4] flex flex-col max-h-[90vh] text-white">
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
            {/* CHANGED: Icon color and title text color */}
            <h2 className="text-xl font-bold text-[#faecc4] flex items-center gap-2">
              <AlertTriangle className="text-[#faecc4]" />
              Alert Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">{alert.title}</h3>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-300">Status:</span>
              {getStatusPill(alert.type)}
            </div>
            {alert.rationale && (
              <div>
                <h4 className="font-semibold text-gray-300 mb-1">Impact Analysis</h4>
                <p className="text-gray-200 text-sm">{alert.rationale}</p>
              </div>
            )}
          </div>
        </div>

        {alert.sourceText && (
          <div className="mt-4 pt-4 border-t border-gray-600 flex-grow overflow-y-auto">
            <h4 className="font-semibold text-gray-300 mb-2">Source Text</h4>
            {/* CHANGED: Source text background and text color */}
            <div className="bg-gray-700 p-4 rounded-lg text-sm text-gray-100 whitespace-pre-wrap font-mono">
              <SimpleMarkdown text={alert.sourceText} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
