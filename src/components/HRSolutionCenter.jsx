import React, { useState, useEffect, useRef } from 'react';
import { Shield, Search, FileUp, ArrowLeft, Check, User, DollarSign, BookOpen, LifeBuoy, GanttChartSquare, Archive, Download, Info } from 'lucide-react';

// --- ROBUST Helper Components ---
function ParsedContent({ text, onSectionLinkClick, onLegalLinkClick }) {
    if (!text || typeof text !== 'string') { return text || ''; }
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
        const recommendationsText = Array.isArray(response.actionableRecommendations) ? `- ${response.actionableRecommendations.join('\n- ')}` : "No recommendations provided.";
        textToDownload += `--- AI GENERATED SOLUTION ---\nExecutive Summary:\n${response.executiveSummary || 'N/A'}\n\nDocument Analysis:\n${response.documentAnalysis || 'N/A'}\n\nHandbook Policy Analysis:\n${response.handbookPolicyAnalysis || 'N/A'}\n\nLegal & Compliance Framework:\n${response.legalAndComplianceFramework || 'N/A'}\n\nActionable Recommendations:\n${recommendationsText}\n\n`;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `HR_Archive_${new Date().toISOString().split('T')[0]}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
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

// --- MODIFIED: This component now filters archives by card title ---
function ArchivedResponses({ archives, cardTitle, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // This is the new filtering logic
    const filteredArchives = archives.filter(archive => archive.cardTitle === cardTitle);

    if (filteredArchives.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="bg-[#4B5C64] p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4 text-[#faecc4] flex items-center justify-center gap-3"><Archive/>Archived Solutions for this Topic</h2>
                <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg">{isOpen ? "Hide Archives" : "Show Archives"}</button>
                {isOpen && (
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto border-t border-gray-600 pt-4">
                        {filteredArchives.map((archive) => (
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
    const fileInputRef = useRef(null);
    const [archivedResponses, setArchivedResponses] = useState([]);
    const [viewedArchive, setViewedArchive] = useState(null);

    useEffect(() => {
        if (isLoading) {
            const messages = [ { text: "Analyzing query and documents...", duration: 15000 }, { text: "Cross-referencing handbook policies...", duration: 20000 }, { text: "Identifying relevant legal frameworks...", duration: 20000 }, { text: "Compiling actionable recommendations...", duration: 10000 }];
            let totalDuration = 0; const timeouts = [];
            messages.forEach(message => { const timeout = setTimeout(() => setLoadingMessage(message.text), totalDuration); timeouts.push(timeout); totalDuration += message.duration; });
            return () => timeouts.forEach(clearTimeout);
        }
    }, [isLoading]);

    const hrCards = [
        { title: "Leave & Accommodation Navigator", description: "This module helps you navigate complex employee leave scenarios, including FMLA, ADA, state-specific leave laws, and workers' compensation claims.", icon: <GanttChartSquare size={36} className="text-white" /> },
        { title: "Disciplinary Action Advisor", description: "Receive guidance on issuing warnings, creating performance improvement plans (PIPs), and handling terminations in a compliant and defensible manner.", icon: <BookOpen size={36} className="text-white" /> },
        { title: "Wage & Hour Compliance", description: "Analyze scenarios related to employee classification (exempt vs. non-exempt), overtime calculations, and other Fair Labor Standards Act (FLSA) rules.", icon: <DollarSign size={36} className="text-white" /> },
        { title: "Workplace Investigation Manager", description: "Get a step-by-step protocol for conducting fair and thorough investigations into claims of harassment, discrimination, or other misconduct.", icon: <Search size={36} className="text-white" /> },
        { title: "Multi-State Compliance Checker", description: "Analyze your existing policies to identify potential compliance gaps for remote employees working in different states with varying labor laws.", icon: <Check size={36} className="text-white" /> },
        { title: "Hiring & Background Checks", description: "Ensure your hiring and background check processes are compliant with the Fair Credit Reporting Act (FCRA) and state-specific 'Ban-the-Box' laws.", icon: <User size={36} className="text-white" /> },
        { title: "Benefits Compliance Assistant", description: "Guidance on handling qualifying life events and ensuring compliance with federal laws like COBRA, ACA, and HIPAA.", icon: <LifeBuoy size={36} className="text-white" /> }
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
        if (!hrQuery && !fileContent) { alert("Please describe a scenario
