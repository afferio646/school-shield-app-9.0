import React, { useState, useEffect, useRef } from 'react';
import { Shield, Search, FileUp, ArrowLeft, Check, User, DollarSign, BookOpen, LifeBuoy, GanttChartSquare, Archive, Download } from 'lucide-react';

// --- Helper Components ---
function ParsedContent({ text, onSectionLinkClick, onLegalLinkClick }) {
    if (typeof text !== 'string') { return text; }
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

// --- Archive Viewer Modal ---
function ArchiveViewerModal({ archive, onClose, onSectionLinkClick, onLegalLinkClick }) {
    if (!archive) return null;
    const handleDownload = () => {
        const { cardTitle, query, fileContent, response } = archive;
        let textToDownload = `Navigation IQ - HR Solutions Center Archive\n========================================\n\nTOPIC: ${cardTitle}\n\nQUERY:\n${query}\n\n`;
        if (fileContent) { textToDownload += `--- UPLOADED DOCUMENT CONTENT ---\n${fileContent}\n\n`; }
        textToDownload += `--- AI GENERATED SOLUTION ---\nExecutive Summary:\n${response.executiveSummary}\n\nDocument Analysis:\n${response.documentAnalysis}\n\nHandbook Policy Analysis:\n${response.handbookPolicyAnalysis}\n\nLegal & Compliance Framework:\n${response.legalAndComplianceFramework}\n\nActionable Recommendations:\n- ${response.actionableRecommendations.join('\n- ')}\n\n`;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HR_Archive_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-blue-400">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
                    <h2 className="text-xl font-bold text-[#faecc4]">{archive.cardTitle}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded-lg text-sm"><Download size={16}/>Download</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><Shield size={24} /></button>
                    </div>
                </div>
                <div className="overflow-y-auto pr-4 text-gray-200 space-y-4">
                    <p className="italic"><strong className="text-gray-400">Original Query:</strong> {archive.query}</p>
                    <div className="space-y-6">
                        <div><h3 className="text-lg font-bold text-blue-300 mb-2">Executive Summary</h3><AIContentRenderer content={archive.response.executiveSummary} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                        <div><h3 className="text-lg font-bold text-blue-300 mb-2">Document Analysis</h3><AIContentRenderer content={archive.response.documentAnalysis} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                        <div><h3 className="text-lg font-bold text-blue-300 mb-2">Handbook Policy Analysis</h3><AIContentRenderer content={archive.response.handbookPolicyAnalysis} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                        <div><h3 className="text-lg font-bold text-blue-300 mb-2">Legal & Compliance Framework</h3><AIContentRenderer content={archive.response.legalAndComplianceFramework} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                        <div><h3 className="text-lg font-bold text-blue-300 mb-2">Actionable Recommendations</h3><AIContentRenderer content={archive.response.actionableRecommendations} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Archived List Component ---
function ArchivedResponses({ archives, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    if (archives.length === 0) return null;
    return (
        <div className="mt-12">
            <div className="bg-[#4B5C64] p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 text-[#faecc4] flex items-center justify-center gap-3"><Archive/>Archived Solutions</h2>
                <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg">{isOpen ? "Hide Archives" : "Show Archives"}</button>
                {isOpen && (
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto border-t border-gray-600 pt-4">
                        {archives.map((archive) => (
                            <button key={archive.id} onClick={() => onView(archive)} className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600">
                                <p className="font-semibold text-white">{archive.cardTitle}</p>
                                <p className="text-xs text-gray-400 truncate">{archive.query}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
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
    const [archivedResponses, setArchivedResponses] = useState([]);
    const [viewedArchive, setViewedArchive] = useState(null);

    useEffect(() => {
        if (isLoading) {
            const messages = [
                { text: "Analyzing query and documents...", duration: 15000 },
                { text: "Cross-referencing handbook policies...", duration: 20000 },
                { text: "Identifying relevant legal frameworks...", duration: 20000 },
                { text: "Compiling actionable recommendations...", duration: 10000 }
            ];
            let totalDuration = 0; const timeouts = [];
            messages.forEach(message => {
                const timeout = setTimeout(() => setLoadingMessage(message.text), totalDuration);
                timeouts.push(timeout); totalDuration += message.duration;
            });
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
    const handleDemoFileUpload = () => {
        const demoFileName = "Employee FMLA Request Form.txt";
        const demoFileContent = "Employee Name: John Doe\nRequest Date: 2025-10-22\nReason for Leave: Spouse undergoing serious medical surgery.\nRequested Start Date: 2025-11-01\nExpected Duration: 4-6 weeks\n\nNotes: Employee has been with the school for 3 years, working full-time.";
        setUploadedFile({ name: demoFileName }); setFileContent(demoFileContent);
    };
    const handleCloseAnalysis = () => { setApiResponse(null); setHrQuery(""); setUploadedFile(null); setFileContent(""); };

    const handleGenerateSolution = async () => {
        if (!hrQuery && !fileContent) { alert("Please describe a scenario or upload a document."); return; }
        setIsLoading(true); setApiResponse(null); setLoadingMessage("Initiating analysis...");
        const prompt = `You are 'Navigation IQ,' an expert AI HR consultant for private, independent K-12 schools. Your tone is professional, authoritative, and deeply analytical. Your entire response MUST be a single, valid JSON object.\n\n**CRITICAL INSTRUCTIONS:**\n1. **Primary Context:** All guidance MUST be tailored for a private, independent K-12 school in the United States.\n2. **Format:** Your entire response must be a single, valid JSON object. Do not include any text outside of the JSON structure.\n3. **Handbook & Legal Citations:** You MUST reference specific handbook sections (e.g., "Section 4.3") and relevant legal precedents or statutes. Format legal cases as *Case v. Defendant* and statutes as **Statute Name (e.g., The Family and Medical Leave Act)** so they can be turned into links. This is not optional.\n4. **Robustness:** Provide detailed, actionable, and comprehensive information. The user is an HR Manager who needs expert-level support that would otherwise take hours of research.\n\n---\n**SCHOOL HANDBOOK FOR CONTEXT:**\n${handbookText}\n---\n**HR SCENARIO & DOCUMENTATION:**\n**Topic:** "${activeCard.title}"\n**User's Query:** "${hrQuery}"\n${fileContent ? `**Content from Uploaded Document (${uploadedFile.name}):**\n${fileContent}` : ''}\n---\n\n**REQUIRED JSON OUTPUT STRUCTURE:**\n\n{\n  "executiveSummary": "A concise, top-level summary of the situation and the primary recommendation. (2-3 sentences)",\n  "documentAnalysis": "If a document was provided, analyze its key points, identify potential issues, and summarize its relevance to the user's query. If no document was provided, state 'No document was submitted for analysis.'",\n  "handbookPolicyAnalysis": "Identify ALL relevant sections from the provided School Handbook. For each section, provide the section number and explain precisely how it applies to this scenario.",\n  "legalAndComplianceFramework": "Detail the applicable legal landscape. Cite specific court cases (*Case v. Defendant*) and legislation (**Statute Name**) that govern this situation. Explain the key legal principles and compliance obligations for the school.",\n  "actionableRecommendations": [\n     "First recommendation as a complete sentence.",\n     "Second recommendation as a complete sentence.",\n     "Third recommendation as a complete sentence."\n  ]\n}`;
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const result = await response.json();
            const jsonText = result.candidates[0].content.parts[0].text;
            const newResponse = JSON.parse(jsonText);
            setApiResponse(newResponse);
            const newArchive = { id: Date.now(), cardTitle: activeCard.title, query: hrQuery, fileContent: fileContent, response: newResponse };
            setArchivedResponses(prev => [newArchive, ...prev]);
        } catch (error) {
            console.error("Error generating AI response:", error);
            setApiResponse({ error: `Failed to generate response. ${error.message}` });
        } finally { setIsLoading(false); }
    };

    if (activeCard) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 text-white">
                <button onClick={() => setActiveCard(null)} className="flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-6 font-semibold"><ArrowLeft size={18} />Back to HR Solutions Center</button>
                <div className="bg-[#4B5C64] p-6 sm:p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#faecc4] mb-2">{activeCard.title}</h2>
                    <div className="bg-gray-800 p-3 rounded-md border-l-4 border-blue-400 mb-6">
                        <p className="text-gray-300 text-sm">{activeCard.description} Describe your scenario in the text box below or upload a relevant document (e.g., a disciplinary write-up, an accommodation request). The system will analyze your input against school policy and applicable laws to provide a comprehensive solution.</p>
                    </div>
                    <textarea className="w-full min-h-[120px] p-3 rounded-lg text-black text-base focus:ring-2 focus:ring-blue-400 focus:outline-none transition mb-4" placeholder="Describe your scenario here..." value={hrQuery} onChange={(e) => setHrQuery(e.target.value)} disabled={isLoading} />
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <button onClick={handleDemoFileUpload} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all disabled:bg-gray-700 disabled:cursor-not-allowed">
                            <FileUp size={18} />Upload Document
                        </button>
                        {uploadedFile && <span className="text-gray-300 text-sm">Selected: {uploadedFile.name}</span>}
                    </div>
                    <button onClick={apiResponse ? handleCloseAnalysis : handleGenerateSolution} disabled={isLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg text-lg transition-all disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? loadingMessage : (apiResponse ? "Close Analysis" : "Generate Solution")}
                    </button>
                </div>
                {apiResponse && (
                    <div className="mt-8 bg-[#4B5C64] p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
                        {apiResponse.error ? (<p className="text-red-400">{apiResponse.error}</p>) : (
                            <>
                                <div><h3 className="text-xl font-bold text-[#faecc4] mb-3">Executive Summary</h3><AIContentRenderer content={apiResponse.executiveSummary} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                                {apiResponse.documentAnalysis && (<div className="border-t border-gray-600 pt-4"><h3 className="text-xl font-bold text-[#faecc4] mb-3">Document Analysis</h3><AIContentRenderer content={apiResponse.documentAnalysis} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>)}
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
            <ArchivedResponses archives={archivedResponses} onView={setViewedArchive} />
            {viewedArchive && <ArchiveViewerModal archive={viewedArchive} onClose={() => setViewedArchive(null)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick}/>}
        </div>
    );
}
