import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';


// This function holds all the specialized AI instructions
const getPromptAndSchemaForModule = (moduleType, userQuery, organizationType) => {
    let context, question, specificInstructions;
    
    if (organizationType === 'school') {
        context = `You are an expert AI consultant for K-12 private school leaders. Your tone is professional, clear, and authoritative.`;
    } else { // non-profit
        context = `You are an expert AI consultant for non-profit leaders. Your tone is professional and authoritative. You must not use school-specific terms like 'student' or 'parent'. Use 'client', 'staff', and 'volunteer' instead.`;
    }

    switch (moduleType) {
        case 'leave':
            question = `Analyze this leave/accommodation request: "${userQuery}"`;
            specificInstructions = `Synthesize FMLA, ADA, relevant state leave laws, and the user's handbook. Provide a step-by-step action plan, including eligibility determination, required forms, and communication templates.`;
            break;
        case 'discipline':
            question = `Analyze this disciplinary scenario: "${userQuery}"`;
            specificInstructions = `Synthesize the handbook's progressive discipline policy, employment law, and potential risks. Recommend a course of action, provide documentation templates, and assess legal exposure.`;
            break;
        case 'wage_hour':
            question = `Analyze this wage & hour query: "${userQuery}"`;
            specificInstructions = `Synthesize FLSA rules, relevant state labor laws, and DOL guidance. Provide a clear classification recommendation (exempt/non-exempt) or an answer regarding overtime, including a compliance checklist.`;
            break;
        // ... Add cases for 'investigation', 'multi_state', 'hiring', 'benefits' with their specific instructions
        default:
            question = `Analyze this HR query: "${userQuery}"`;
            specificInstructions = `Provide a comprehensive, actionable response.`;
            break;
    }

    const prompt = `${context}\n${question}\n${specificInstructions}\nStructure your response as an array of objects, where each object has a "header" and a "text" property.`;

    const responseSchema = {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: { "header": { "type": "STRING" }, "text": { "type": "STRING" } },
            required: ["header", "text"]
        }
    };

    return { prompt, responseSchema };
};


export default function SolutionCenter({ module, onBack, apiKey, organizationType, AIContentRendererComponent }) {
    const [issue, setIssue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedResponse, setGeneratedResponse] = useState(null);

    const handleGenerate = async () => {
        if (!issue.trim()) return;
        
        setIsAnalyzing(true);
        setGeneratedResponse(null);

        const { prompt, responseSchema } = getPromptAndSchemaForModule(module.id, issue, organizationType);

        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.3
                }
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API request failed: ${response.status} - ${errorBody?.error?.message || 'Unknown API error'}`);
            }
            const result = await response.json();
            if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Invalid response structure from API.");
            }
            const jsonText = result.candidates[0].content.parts[0].text;
            setGeneratedResponse(JSON.parse(jsonText));

        } catch (error) {
            console.error("Error generating AI response:", error);
            setGeneratedResponse([{ header: "Error", text: `An error occurred: ${error.message}. Please check your API key and the console.` }]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4">
                <ArrowLeft size={16} />
                Back to HR Solutions Center
            </button>

            <div className="rounded-2xl shadow-2xl p-6" style={{ background: "#4B5C64" }}>
                <h2 className="text-2xl font-bold text-gold mb-2">{module.title}</h2>
                <p className="text-gray-300 mb-6">{module.summary}</p>

                <textarea
                    className="w-full min-h-[140px] p-3 rounded-lg text-black text-base"
                    placeholder={`Describe your scenario here...\n e.g., "Employee requesting FMLA for spouse's surgery"`}
                    value={issue}
                    onChange={e => setIssue(e.target.value)}
                    disabled={isAnalyzing}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isAnalyzing || !issue.trim()}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md disabled:bg-gray-500"
                >
                    {isAnalyzing ? "Analyzing..." : "Generate Solution"}
                </button>
            </div>

            {generatedResponse && (
                <div className="mt-8 rounded-2xl shadow-2xl p-6" style={{ background: "#4B5C64" }}>
                     <AIContentRendererComponent content={generatedResponse} />
                </div>
            )}
        </div>
    );
}
