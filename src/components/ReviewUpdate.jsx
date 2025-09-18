import React, { useState, useEffect } from 'react';
import { FileText, Lightbulb, Check, Archive, X, ArrowLeft, LoaderCircle } from "lucide-react";

const GEMINI_API_KEY = "AIzaSyCYAfKVJ9BTLWHpNLDr0bHDsvYOdWMfIpw"; // Your API Key

export default function ReviewUpdate({ update, handbookSectionText, onApprove, onArchive, onDismiss, onClose, onViewAlertDetail }) {
    
    // State to hold the AI-generated suggestion
    const [suggestedLanguage, setSuggestedLanguage] = useState("");
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Function to generate the AI suggestion
        const generateSuggestion = async () => {
            if (!handbookSectionText || handbookSectionText.startsWith("Error:")) {
                setError("Cannot generate a suggestion because the original handbook text is missing.");
                setIsGenerating(false);
                return;
            }

            setIsGenerating(true);
            setError("");

            const prompt = `
                You are an expert legal and policy advisor for K-12 independent schools.
                An issue has been identified that requires a policy update.
                
                ISSUE DETAILS:
                - Title: ${update.title}
                - Rationale: ${update.rationale}
                - Source of Alert: ${update.sourceText || 'A new legal or regulatory development.'}

                ORIGINAL HANDBOOK TEXT (from section "${update.affectedSection}"):
                ---
                ${handbookSectionText}
                ---

                YOUR TASK:
                Draft a concise, legally sound paragraph to be added to the handbook. This new language must directly resolve the issue described in the alert.

                RULES:
                1. Your response MUST be ONLY the new paragraph of suggested text.
                2. Do NOT include conversational phrases like "Here is the suggestion:".
                3. Do NOT repeat or rephrase the original policy text.
                4. The new paragraph should be ready to be copied and pasted directly into the handbook.
            `;

            try {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
                const payload = {
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 500,
                    }
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const result = await response.json();
                const generatedText = result.candidates[0]?.content?.parts[0]?.text;
                
                if (generatedText) {
                    setSuggestedLanguage(generatedText.trim());
                } else {
                    throw new Error("Received an empty response from the AI.");
                }

            } catch (err) {
                console.error("AI Generation Error:", err);
                setError(`Failed to generate suggestion. ${err.message}`);
            } finally {
                setIsGenerating(false);
            }
        };

        generateSuggestion();
    }, [update, handbookSectionText]); // Re-run if the update or text changes

    // A new update object that includes the generated language for the onApprove function
    const updatedSuggestion = { ...update, suggestedLanguage: suggestedLanguage };

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                <ArrowLeft size={16} />
                Back to IQ Handbook Center
            </button>

            <div className="bg-[#4B5C64] text-white p-6 rounded-2xl shadow-2xl">
                <h1 className="text-3xl font-bold text-[#faecc4] mb-2">Review Proposed Handbook Change</h1>
                <p className="text-gray-300 mb-6">Analyze the generated suggestion and choose an action.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
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

                    {/* Column 3: Proposed Handbook Change */}
                    <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-yellow-300 mb-3 border-b border-gray-600 pb-2">
                           IQ Suggested Handbook Change/Addition
                        </h2>
                        <div className="bg-gray-900 p-3 rounded-md min-h-[150px] overflow-y-auto flex-grow flex flex-col justify-center">
                            {isGenerating && (
                                <div className="text-center text-gray-400 animate-pulse">
                                    <LoaderCircle className="mx-auto mb-2" />
                                    <p>Generating suggestion...</p>
                                </div>
                            )}
                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}
                            {!isGenerating && !error && (
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                    <p className="text-gray-400 italic border-b border-dashed border-gray-600 pb-2 mb-2">Original Text Reference:</p>
                                    <p className="text-gray-400 text-xs opacity-70 max-h-20 overflow-y-auto">{handbookSectionText}</p>
                                    <p className="text-yellow-300 italic border-b border-dashed border-gray-600 pb-2 my-2">Suggested Addition:</p>
                                    <p className="bg-blue-900 text-blue-200 p-2 rounded-md my-1 block">{suggestedLanguage}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Action Buttons --- */}
                <div className="mt-8 pt-6 border-t border-gray-600 flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => onApprove(updatedSuggestion)}
                        disabled={isGenerating || !!error}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:transform-none disabled:cursor-not-allowed"
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
