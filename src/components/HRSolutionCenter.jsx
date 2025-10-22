import React, { useState, useEffect, useRef } from 'react';
import { FileUp, ArrowLeft, Info, GanttChartSquare, BookOpen, DollarSign, Search, Check, User, LifeBuoy } from 'lucide-react';

// --- ROBUST Helper Components ---
function ParsedContent({ text, onSectionLinkClick, onLegalLinkClick }) {
    // CRASH FIX: Handles null, undefined, or non-string values gracefully.
    if (!text || typeof text !== 'string') {
        return text || ''; // Return the value or an empty string to prevent crashes.
    }
    const sectionSrc = 'Sections?\\s\\d+(?:\\.\\d+)?';
    const standaloneNumberSrc = '\\b\\d+\\.\\d+\\b';
    const caseLawSrc = '\\*[^*]+\\s?v\\.\\s?[^*]+\\*';
    const boldSrc = '\\*\\*.*?\\*\\*';
    const combinedRegex = new RegExp(`(${sectionSrc}|${standaloneNumberSrc}|${caseLawSrc}|${boldSrc})`, 'gi');
    const sectionRegex = new RegExp(`^${sectionSrc}$`, 'i');
    const standaloneNumberRegex = new RegExp(`^${standaloneNumberSrc}$`);
    const caseLawRegex = new RegExp(`^${caseLawSrc}$`);
    const boldRegex = new RegExp(`^${boldSrc}$`);
    const statuteKeywords = ['Act', 'Title', 'Rule', 'Statute', 'Code', 'U.S.C.', 'FERPA', 'IDEA'];
    const parts = text.split(combinedRegex).filter(Boolean);
    return (
        <>
            {parts.map((part, i) => {
                if (sectionRegex.test(part) || standaloneNumberRegex.test(part)) {
                    const sectionNumberMatch = part.match(/(\d+(\.\d+)?)/);
                    if (sectionNumberMatch) { const sectionNumber = sectionNumberMatch[0]; return (<button key={i} onClick={(e) => { e.stopPropagation(); onSectionLinkClick(sectionNumber); }} className="text-blue-300 underline hover:text-blue-200 font-bold focus:outline-none inline">{part}</button>); }
                }
                if (caseLawRegex.test(part)) {
                    const caseName = part.slice(1, -1); return <button key={i} onClick={(e) => { e.stopPropagation(); onLegalLinkClick(caseName); }} className="text-blue-300 underline hover:text-blue-200 font-semibold focus:outline-none inline">{caseName}</button>;
                }
                if (boldRegex.test(part)) {
                    const innerText = part.slice(2, -2);
                    if (statuteKeywords.some(keyword => innerText.includes(keyword))) { return <button key={i} onClick={(e) => { e.stopPropagation(); onLegalLinkClick(innerText); }} className="text-blue-300 underline hover:text-blue-200 font-semibold focus:outline-none inline">{innerText}</button>; }
                    return <strong key={i} className="text-[#faecc4]">{innerText}</strong>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

// FIX #1: This renderer now correctly handles arrays for recommendations.
function AIContentRenderer({ content, onSectionLinkClick, onLegalLinkClick }) {
    if (!content) return null;
    if (typeof content === 'string') {
        return (<div className="text-white space-y-2 whitespace-pre-line">{content.split('\n').filter(line => line.trim() !== '').map((line, index) => <p key={index}><ParsedContent text={line} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></p>)}</div>);
    }
    if (Array.isArray(content)) {
        return (<ol className="list-decimal list-inside space-y-2">{content.map((item, index) => <li key={index}><ParsedContent text={item} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></li>)}</ol>);
    }
    return <div className="text-white"><ParsedContent text={JSON.stringify(content, null, 2)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>;
}

// --- Main HR Solution Center Component ---
export default function HRSolutionCenter({ apiKey, handbookText, onSectionLinkClick, onLegalLinkClick }) {
    const [activeCard, setActiveCard] = useState(null);
    const [hrQuery, setHrQuery] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [apiResponse, setApiResponse] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isLoading) {
            const messages = [ { text: "Analyzing query and documents...", duration: 15000 }, { text: "Cross-referencing handbook policies...", duration: 20000 }, { text: "Identifying relevant legal frameworks...", duration: 20000 }, { text: "Compiling actionable recommendations...", duration: 10000 }];
            let totalDuration = 0; const timeouts = [];
            messages.forEach(message => { const timeout = setTimeout(() => setLoadingMessage(message.text), totalDuration); timeouts.push(timeout); totalDuration += message.duration; });
            return () => timeouts.forEach(clearTimeout);
        }
    }, [isLoading]);

    const hrCards = [
        { title: "Leave & Accommodation Navigator", description: "Navigate FMLA, ADA, state leave, and workers' comp.", icon: <GanttChartSquare size={36} className="text-white" /> },
        { title: "Disciplinary Action Advisor", description: "Guidance on warnings, improvement plans, and terminations.", icon: <BookOpen size={36} className="text-white" /> },
        { title: "Wage & Hour Compliance", description: "Check employee classifications and overtime rules.", icon: <DollarSign size={36} className="text-white" /> },
        { title: "Workplace Investigation Manager", description: "Step-by-step protocols for harassment and discrimination claims.", icon: <Search size={36} className="text-white" /> },
        { title: "Multi-State Compliance Checker", description: "Analyze policy gaps for remote employees in different states.", icon: <Check size={36} className="text-white" /> },
        { title: "Hiring & Background Checks", description: "Ensure compliance with FCRA and 'Ban-the-Box' laws.", icon: <User size={36} className="text-white" /> },
        { title: "Benefits Compliance Assistant", description: "Guidance on COBRA, ACA, and HIPAA qualifying events.", icon: <LifeBuoy size={36} className="text-white" /> }
    ];

    const handleCardClick = (card) => { setActiveCard(card); setApiResponse(null); setHrQuery(""); setUploadedFile(null); setFileContent(""); };
    const handleCloseAnalysis = () => { setApiResponse(null); setHrQuery(""); setUploadedFile(null); setFileContent(""); };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setFileContent(e.target.result);
            reader.readAsText(file);
        }
    };

    const handleGenerateSolution = async () => {
        if (!hrQuery && !fileContent) { alert("Please describe a scenario or upload a document."); return; }
        setIsLoading(true); setApiResponse(null); setLoadingMessage("Initiating analysis...");
        const prompt = `You are 'Navigation IQ,' an expert AI HR consultant for private, independent K-12 schools. Your entire response MUST be a single, valid JSON object.\n\n**CRITICAL INSTRUCTIONS:**\n1. **Primary Context:** All guidance MUST be tailored for a private, independent K-12 school.\n2. **Format:** Your entire response MUST be a single, valid JSON object.\n3. **Citations:** You MUST reference specific handbook sections (e.g., "Section 4.3") and relevant legal precedents or statutes. Format legal cases as *Case v. Defendant* and statutes as **Statute Name**.\n\n**SCHOOL HANDBOOK FOR CONTEXT:**\n${handbookText}\n\n**HR SCENARIO & DOCUMENTATION:**\n**Topic:** "${activeCard.title}"\n**User's Query:** "${hrQuery}"\n${fileContent ? `**Content from Uploaded Document (${uploadedFile.name}):**\n${fileContent}` : ''}\n\n**REQUIRED JSON OUTPUT STRUCTURE:**\n{\n  "executiveSummary": "...",\n  "documentAnalysis": "...",\n  "handbookPolicyAnalysis": "...",\n  "legalAndComplianceFramework": "...",\n  "actionableRecommendations": [\n     "First recommendation.",\n     "Second recommendation."\n  ]\n}`;
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const result = await response.json();
            const jsonText = result.candidates[0].content.parts[0].text;
            setApiResponse(JSON.parse(jsonText));
        } catch (error) {
            console.error("Error generating AI response:", error);
            setApiResponse({ error: `Failed to generate a valid response. Please try again. Details: ${error.message}` });
        } finally { setIsLoading(false); }
    };

    if (activeCard) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 text-white">
                <button onClick={() => setActiveCard(null)} className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-6 font-semibold"><ArrowLeft size={18} />Back to HR Solutions Center</button>
                <div className="bg-[#4B5C64] p-6 sm:p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#faecc4] mb-4">{activeCard.title}</h2>
                    {/* FIX #3: Professional instruction styling */}
                    <div className="flex items-start gap-3 text-gray-300 border-t border-b border-gray-600 py-4 mb-6">
                        <Info size={24} className="flex-shrink-0 mt-1 text-blue-300" />
                        <p className="text-sm"><strong>Instructions:</strong> {activeCard.description} Describe your scenario in the text box below or upload a relevant document. The system will analyze your input to provide a comprehensive solution.</p>
                    </div>
                    <textarea className="w-full min-h-[120px] p-3 rounded-lg text-black text-base focus:ring-2 focus:ring-blue-400 focus:outline-none transition mb-4" placeholder="Describe your scenario here..." value={hrQuery} onChange={(e) => setHrQuery(e.target.value)} disabled={isLoading} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.doc,.docx" />
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <button onClick={() => fileInputRef.current.click()} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all disabled:bg-gray-700 disabled:cursor-not-allowed">
                            <FileUp size={18} />Upload Document
                        </button>
                        {uploadedFile && <span className="text-gray-300 text-sm">Selected: {uploadedFile.name}</span>}
                    </div>
                    {/* FIX #2: Button logic is now smarter */}
                    <button onClick={apiResponse ? handleCloseAnalysis : handleGenerateSolution} disabled={isLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg text-lg transition-all disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? loadingMessage : (apiResponse ? "Close Analysis" : "Generate Solution")}
                    </button>
                </div>
                {apiResponse && (
                    <div className="mt-8 bg-[#4B5C64] p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
                        {apiResponse.error ? (<p className="text-red-400">{apiResponse.error}</p>) : (
                            <>
                                <div><h3 className="text-xl font-bold text-[#faecc4] mb-3">Executive Summary</h3><AIContentRenderer content={apiResponse.executiveSummary} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                                <div className="border-t border-gray-600 pt-4"><h3 className="text-xl font-bold text-[#faecc4] mb-3">Document Analysis</h3><AIContentRenderer content={apiResponse.documentAnalysis} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                                <div className="border-t border-gray-600 pt-4"><h3 className="text-xl font-bold text-[#faecc4] mb-3">Handbook Policy Analysis</h3><AIContentRenderer content={apiResponse.handbookPolicyAnalysis} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                                <div className="border-t border-gray-600 pt-4"><h3 className="text-xl font-bold text-[#faecc4] mb-3">Legal & Compliance Framework</h3><AIContentRenderer content={apiResponse.legalAndComplianceFramework} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                                <div className="border-t border-gray-600 pt-4"><h3 className="text-xl font-bold text-[#faecc4] mb-3">Actionable Recommendations</h3><AIContentRenderer content={apiResponse.actionableRecommendations} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-bold text-center mb-8">IQ HR Solutions Center</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hrCards.map(card => (
                    <button key={card.title} onClick={() => handleCardClick(card)} className="bg-[#4B5C64] p-6 rounded-2xl shadow-lg text-white text-left hover:bg-gray-700 hover:scale-105 transition-all duration-300">
                        <div className="mb-4">{card.icon}</div>
                        <h3 className="text-xl font-bold text-[#faecc4] mb-2">{card.title}</h3>
                        <p className="text-gray-300">{card.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
