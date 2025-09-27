import React, { useState, useEffect } from 'react';
import { FileText, Lightbulb, Check, Archive, X, ArrowLeft } from "lucide-react";

export default function ReviewUpdate({ update, handbookSectionText, onApprove, onArchive, onDismiss, onClose, onViewAlertDetail, apiKey }) {
    
    const [suggestedLanguage, setSuggestedLanguage] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false); 

    useEffect(() => {
        const generateSuggestion = async () => {
            setIsAnalyzing(true); 
            
            // BUG FIX: The check for '!apiKey' is now correctly cased to match the prop.
            if (!update || !handbookSectionText || !apiKey) {
                setSuggestedLanguage("Error: Missing data to generate suggestion.");
                setIsAnalyzing(false);
                return;
            }

            const prompt = `
                ROLE: You are an expert K-12 school policy writer.
                TASK: Revise a section of an employee handbook based on a new legal alert.

                BACKGROUND:
                - The school needs to update its policy based on a new requirement.
                - Rationale for the change: "${update.rationale}"
                - The source text of the new law/regulation is: "${update.sourceText}"
                - The CURRENT handbook text for the affected section is: "${handbookSectionText}"

                INSTRUCTIONS:
                Based on all the information above, write a single, concise paragraph of new policy language that addresses the issue described in the rationale and source text. This new paragraph will be ADDED to the existing handbook section. Do NOT rewrite the entire section. Only provide the new paragraph to be added. Your response must be ONLY the text of the new paragraph.
            `;
           
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                const result = await response.json();
                const suggestion = result.candidates[0]?.content?.parts[0]?.text || "Could not generate a suggestion.";
                setSuggestedLanguage(suggestion.trim());

            } catch (error) {
                console.error("Error generating suggestion:", error);
                setSuggestedLanguage(`Failed to generate suggestion. ${error.message}`);
            } finally {
                setIsAnalyzing(false);
            }
        };

        generateSuggestion();
    }, [update, handbookSectionText, apiKey]);


    const renderProposedChange = () => {
        if (!handbookSectionText) {
            return <p className="text-red-400">Error: Could not load the original handbook section text.</p>;
        }
        
        return (
            <div className="text-sm leading-relaxed font-mono space-y-4">
                <div>
                    <strong className="text-yellow-300 block mb-1">Original Text Reference:</strong>
                    <div className="bg-white text-black p-3 rounded-md max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {handbookSectionText}
                    </div>
                </div>

                <div>
                    <strong className="text-yellow-300 block mb-1">Suggested Addition:</strong>
                    <div className="bg-blue-900 bg-opacity-70 text-blue-200 p-3 rounded-md whitespace-pre-wrap min-h-[100px] flex items-center justify-center">
                        {isAnalyzing ? (
                            <span className="text-gray-400 italic">Generating suggestion...</span>
                        ) : (
                            suggestedLanguage
                        )}
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

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                    <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-yellow-300 mb-3 border-b border-gray-600 pb-2">
                            IQ Suggested Handbook Change/Addition
                        </h2>
                        <div className="p-3 rounded-md flex-grow">
                            {renderProposedChange()}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-600 flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => onApprove({ ...update, suggestedLanguage: suggestedLanguage })}
                        disabled={isAnalyzing}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <Check size={20} />
                        Approve & Add to Handbook
                    </button>
                    <button 
                        onClick={() => onArchive(update)}
                        disabled={isAnalyzing}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <Archive size={20} />
                        Archive for Future Reference
                    </button>
                    <button 
                        onClick={() => onDismiss(update)}
                        disabled={isAnalyzing}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                        Dismiss Suggestion
                    </button>
                </div>
            </div>
        </div>
    );
}
