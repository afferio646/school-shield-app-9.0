import React, { useState, useEffect } from 'react';
import { FileText, Lightbulb, Check, Archive, X, ArrowLeft } from "lucide-react";

export default function ReviewUpdate({ update, handbookSectionText, onApprove, onArchive, onDismiss, onClose, onViewAlertDetail, apiKey }) {
    
    // --- CHANGE 1: The initial state is now 'false' ---
    const [suggestedLanguage, setSuggestedLanguage] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false); 

    useEffect(() => {
        const generateSuggestion = async () => {
            // --- CHANGE 2: Set analyzing to 'true' right before the API call ---
            setIsAnalyzing(true); 
            
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
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
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
        // ... (this function remains the same)
    };

    return (
        // ... (the rest of your component's JSX remains the same)
    );
}
