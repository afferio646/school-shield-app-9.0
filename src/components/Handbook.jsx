import React, { useState, useRef } from 'react';
import { BookOpen, Search, AlertCircle, TrendingUp, ClipboardCheck } from "lucide-react";

import PolicyWatchtower from './PolicyWatchtower.jsx';
import HandbookComparisonCard from './HandbookComparisonCard.jsx';

// (Helper components can remain as they are)
function HighlightedText({ text, highlight }) { /* ... */ }
function HandbookAuditCard() { /* ... */ }
function SectionHeader({ icon, title }) { /* ... */ }

export default function Handbook({
    handbookContent, // This will be the full handbookData object
    onSectionLinkClick,
    pendingUpdates,
    archivedUpdates,
    monitoredTrends,
    onViewUpdate,
    onViewAlertDetail,
    apiKey,
    HandbookVulnerabilitiesCardComponent,
    handbookSections
}) {
    const [selectedSection, setSelectedSection] = useState("");
    const [isSectionLanguageOpen, setIsSectionLanguageOpen] = useState(false);
    const [handbookTopicQuery, setHandbookTopicQuery] = useState("");
    const [handbookTopicResults, setHandbookTopicResults] = useState(null);
    const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestedUpdate, setSuggestedUpdate] = useState("Based on the identified vulnerability, consider updating the policy...");

    // UPDATED SEARCH LOGIC
    const handleTopicSearch = () => {
        if (!handbookTopicQuery) return;
        setIsAnalyzingTopic(true);
        setHandbookTopicResults(null);
        setTimeout(() => {
            const query = handbookTopicQuery.toLowerCase();
            const results = {};
            // Search through each individual subsection for a match
            for (const sectionTitle in handbookContent) {
                const sectionText = handbookContent[sectionTitle];
                if (sectionText.toLowerCase().includes(query)) {
                    results[sectionTitle] = sectionText;
                }
            }
            setHandbookTopicResults(results);
            setIsAnalyzingTopic(false);
        }, 1500);
    };

    const handleCloseSection = () => {
        setIsSectionLanguageOpen(false);
    }
    
    const currentVulnerabilities = selectedSection ? (handbookSections(onSectionLinkClick).find(s => s.section.startsWith(selectedSection.split('.')[0]))?.vulnerabilities || []) : [];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PolicyWatchtower
                pendingUpdates={pendingUpdates}
                archivedUpdates={archivedUpdates}
                monitoredTrends={monitoredTrends}
                onViewUpdate={onViewUpdate}
                onViewAlertDetail={onViewAlertDetail} 
            />

            <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
                <div className="p-6 text-white">
                    <SectionHeader icon={<BookOpen className="text-[#faecc4]" size={26} />} title="Handbook Section Review" />
                    
                    <h3 className="text-lg font-bold mb-2 text-[#faecc4]">1. Review by Section</h3>
                    <label className="block font-medium mb-1 text-gray-200">Select Section to review the entire section language</label>
                    <select
                        className="block w-full border rounded p-2 shadow text-black mb-2"
                        value={selectedSection}
                        onChange={e => { setSelectedSection(e.target.value); setIsSectionLanguageOpen(true); }}
                    >
                        <option value="" disabled>-- Select a Section to Review --</option>
                        {/* The dropdown now lists every individual subsection title */}
                        {Object.keys(handbookContent).map((sectionTitle) => (
                            <option key={sectionTitle} value={sectionTitle}>{sectionTitle}</option>
                        ))}
                    </select>
                    
                    {isSectionLanguageOpen && selectedSection && (
                        <>
                            <div className="bg-gray-800 p-4 rounded-lg mt-4 shadow-inner border border-gray-700 whitespace-pre-line text-gray-200" style={{ maxHeight: "320px", overflowY: "auto" }}>
                                {handbookContent[selectedSection]}
                            </div>
                            <button className="text-sm font-semibold text-blue-300 hover:text-blue-200 mt-2" onClick={handleCloseSection}>
                                Close Section
                            </button>
                        </>
                    )}

                    {selectedSection && (
                        <div className="mt-6 border-t border-gray-600 pt-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Potential Section Vulnerabilities</h4>
                            {currentVulnerabilities.length > 0 ? (
                                <ul className="space-y-2">
                                    {currentVulnerabilities.map((vuln, i) => (
                                        <li key={i} className="p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg flex items-start gap-3">
                                            <AlertCircle size={18} className="text-red-400 mt-1 flex-shrink-0" />
                                            <span className="text-white text-sm">{vuln.text}</span>
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-700 text-gray-300 flex-shrink-0">{vuln.source}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No specific vulnerabilities identified for this section.</p>
                            )}
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowSuggestionModal(true)}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all"
                                >
                                    <TrendingUp size={18} />
                                    Suggested Handbook Changes
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-8 border-t border-gray-600 pt-6">
                        <h3 className="text-lg font-bold mb-2 text-[#faecc4]">2. Search Handbook by Topic</h3>
                        <p className="text-gray-300 mb-2">Enter a topic to find relevant language in the handbook.</p>
                        <textarea className="w-full min-h-[80px] p-2 rounded-md text-black" placeholder="e.g., Confidentiality, Remote Work, Discipline..." value={handbookTopicQuery} onChange={(e) => setHandbookTopicQuery(e.target.value)} />
                        <button onClick={handleTopicSearch} disabled={isAnalyzingTopic} className="bg-blue-700 text-white font-semibold px-5 py-2 mt-2 rounded-lg shadow hover:bg-blue-800 disabled:bg-gray-500">
                            {isAnalyzingTopic ? 'Analyzing...' : 'Analyze Handbook'}
                        </button>

                        {handbookTopicResults && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-lg">Search Results for "{handbookTopicQuery}"</h4>
                                    <button onClick={() => setHandbookTopicResults(null)} className="text-sm font-semibold text-blue-300 hover:text-blue-200">Close</button>
                                </div>
                                {Object.keys(handbookTopicResults).length > 0 ? (
                                    Object.entries(handbookTopicResults).map(([title, text]) => (
                                        <div key={title} className="mt-2 p-3 bg-gray-700 rounded-lg">
                                            <h5 className="font-bold text-blue-300">{title}</h5>
                                            <div className="mt-1 border-t border-gray-600 pt-1">
                                                <HighlightedText text={text} highlight={handbookTopicQuery} />
                                            </div>
                                        </div>
                                    ))
                                ) : <p className="mt-2 text-gray-400">No results found.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <HandbookVulnerabilitiesCardComponent />
            <HandbookComparisonCard apiKey={apiKey} />
            <HandbookAuditCard /> 

            {showSuggestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-black">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <TrendingUp className="text-emerald-600" size={24} /> Suggested Update
                        </h3>
                        <div className="mb-6 text-slate-700 font-medium whitespace-pre-line">{suggestedUpdate}</div>
                        <div className="flex justify-end gap-2">
                            <button className="rounded-lg px-5 py-2 border border-gray-300" onClick={() => setShowSuggestionModal(false)}>Cancel</button>
                            <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 rounded-lg py-2" onClick={() => setShowSuggestionModal(false)}>
                                Add Suggestion to Handbook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
