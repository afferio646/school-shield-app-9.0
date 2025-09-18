import React from 'react';
import { FileText, Lightbulb, Check, Archive, X, ArrowLeft } from "lucide-react";

export default function ReviewUpdate({ update, handbookSectionText, onApprove, onArchive, onDismiss, onClose, onViewAlertDetail }) {
    
    // This helper function renders the handbook text with the new suggestion.
    const renderProposedChange = () => {
        if (!handbookSectionText) {
            return <p className="text-red-400">Error: Could not load the original handbook section text.</p>;
        }
        
        return (
            <div className="text-sm leading-relaxed font-mono space-y-4">
                {/* --- CHANGE 2: Styling Change for Original Text --- */}
                {/* This div now has a white background and black text for better readability. */}
                <div>
                    <strong className="text-yellow-300 block mb-1">Original Text Reference:</strong>
                    <div className="bg-white text-black p-3 rounded-md max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {handbookSectionText}
                    </div>
                </div>
                {/* --- END of CHANGE 2 --- */}

                {/* The suggested addition remains styled as it was before. */}
                <div>
                    <strong className="text-yellow-300 block mb-1">Suggested Addition:</strong>
                    <div className="bg-blue-900 bg-opacity-70 text-blue-200 p-3 rounded-md whitespace-pre-wrap">
                        {update.suggestedLanguage}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                <ArrowLeft size={16} />
                Back to IQ Handbook Center
            </button>

            <div className="bg-[#4B5C64] text-white p-6 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-[#faecc4] mb-2">Review Proposed Handbook Change</h1>
                <p className="text-gray-300 mb-6">Analyze the generated suggestion and choose an action.</p>

                {/* --- CHANGE 1: Layout Change --- */}
                {/* The layout is now a flex column. The first two cards are in a grid inside it,
                    and the third card is below them, taking the full width. */}
                <div className="flex flex-col gap-6">
                    {/* Top row with two columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Column 1: The Alert/Trend */}
                        <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-blue-300 mb-3 border-b border-gray-600 pb-2">
                                <FileText size={20} /> IQ Alert
                            </h2>
                            <div className="text-gray-200 flex-grow">
                                <button 
                                    onClick={() => onViewAlertDetail(update)} 
                                    className="font-semibold text-left w-full hover:text-blue-300 transition-colors"
                                >
                                    {update.title}
                                </button>
                                <p className="text-xs text-gray-400 mt-1">Date Identified: {update.date}</p>
                                <p className={`mt-1 text-xs font-bold ${update.type === 'Immediate Action Required' ? 'text-red-400' : 'text-yellow-400'}`}>{update.type}</p>
                            </div>
                        </div>

                        {/* Column 2: IQ Analysis */}
                        <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-green-300 mb-3 border-b border-gray-600 pb-2">
                                <Lightbulb size={20} /> IQ Analysis
                            </h2>
                            <div className="text-gray-200 text-sm space-y-3 flex-grow">
                                <div>
                                    <strong className="block text-gray-400">Affected Section:</strong>
                                    <p>{update.affectedSection}</p>
                                </div>
                                <div>
                                    <strong className="block text-gray-400">Rationale:</strong>
                                    <p>{update.rationale}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom, full-width card */}
                    <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-yellow-300 mb-3 border-b border-gray-600 pb-2">
                            IQ Suggested Handbook Change/Addition
                        </h2>
                        <div className="p-3 rounded-md flex-grow">
                            {renderProposedChange()}
                        </div>
                    </div>
                </div>
                {/* --- END of CHANGE 1 --- */}

                {/* --- Action Buttons --- */}
                <div className="mt-8 pt-6 border-t border-gray-600 flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => onApprove(update)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <Check size={20} />
                        Approve & Add to Handbook
                    </button>
                    <button 
                        onClick={() => onArchive(update)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <Archive size={20} />
                        Archive for Future Reference
                    </button>
                    <button 
                        onClick={() => onDismiss(update)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <X size={20} />
                        Dismiss Suggestion
                    </button>
                </div>
            </div>
        </div>
    );
}
