import React, { useState } from 'react';
import { BookOpen, Search, AlertCircle, TrendingUp, ClipboardCheck } from "lucide-react";

import PolicyWatchtower from './PolicyWatchtower.jsx';
import HandbookComparisonCard from './HandbookComparisonCard.jsx';

// Helper component for search result highlighting
function HighlightedText({ text, highlight }) {
    if (!highlight || !text) return <p className="text-sm leading-relaxed whitespace-pre-line">{text}</p>;
    // Escape special characters in the highlight string for the RegExp
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <p className="text-sm leading-relaxed whitespace-pre-line">
            {parts.map((part, i) => 
                regex.test(part) ? <span key={i} className="bg-yellow-300 font-bold text-black px-1 rounded">{part}</span> : part
            )}
        </p>
    );
}

function HandbookAuditCard() {
    return (
        <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
            <div className="p-6 text-white">
                <SectionHeader icon={<ClipboardCheck className="text-[#faecc4]" size={26} />} title="IQ Handbook Audit" />
                <div className="space-y-3 text-gray-200">
                    <p className="font-semibold">"Comprehensive Handbook Intelligence Audit - Ensuring Policy Excellence & Legal Compliance"</p>
                    <p>A systematic, multi-source analysis of your school handbook leveraging industry-leading databases, federal & state legislative monitoring, peer benchmarking from multiple schools, and expert legal review.</p>
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                    <button className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800">Audit Quarterly</button>
                    <button className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800">Audit Annually</button>
                    <button className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800">Our 6-Stage Audit Process</button>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
    );
}

export default function Handbook({
    handbookContent,
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
    const [selectedSubsectionId, setSelectedSubsectionId] = useState("");
    const [isSectionLanguageOpen, setIsSectionLanguageOpen] = useState(false);
    const [handbookTopicQuery, setHandbookTopicQuery] = useState("");
    const [handbookTopicResults, setHandbookTopicResults] = useState(null);
    const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);

    // Helper function to find a subsection by its ID (e.g., "1.2")
    const getSubsectionById = (id) => {
        if (!id || !handbookContent) return null;
        for (const section of handbookContent) {
            const found = section.subsections.find(sub => sub.id === id);
            if (found) return found;
        }
        return null;
    };
    
    const selectedSubsection = getSubsectionById(selectedSubsectionId);

    // CORRECTED SEARCH LOGIC
    const handleTopicSearch = () => {
        if (!handbookTopicQuery) return;
        setIsAnalyzingTopic(true);
        setHandbookTopicResults(null);
        setTimeout(() => {
            const query = handbookTopicQuery.toLowerCase();
            const results = [];
            // Correctly iterate through the array of sections and their subsections
            handbookContent.forEach(section => {
                section.subsections.forEach(subsection => {
                    if (subsection.content.toLowerCase().includes(query)) {
                        results.push(subsection); // Add the whole subsection object to results
                    }
                });
            });
            setHandbookTopicResults(results);
            setIsAnalyzingTopic(false);
        }, 1500);
    };
    
    const handleCloseSection = () => {
        setIsSectionLanguageOpen(false);
    }
    
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
                    {/* CORRECTED DROPDOWN MENU LOGIC */}
                    <select
                        className="block w-full border rounded p-2 shadow text-black mb-2"
                        value={selectedSubsectionId}
                        onChange={e => { setSelectedSubsectionId(e.target.value); setIsSectionLanguageOpen(true); }}
                    >
                        <option value="" disabled>-- Select a Section to Review --</option>
                        {handbookContent.map(section => (
                            <optgroup key={section.id} label={`${section.id}. ${section.title}`}>
                                {section.subsections.map(subsection => (
                                    <option key={subsection.id} value={subsection.id}>
                                        {subsection.id} {subsection.title}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    
                    {isSectionLanguageOpen && selectedSubsection && (
                        <>
                            <div className="bg-gray-800 p-4 rounded-lg mt-4 shadow-inner border border-gray-700 whitespace-pre-line text-gray-200" style={{ maxHeight: "320px", overflowY: "auto" }}>
                                {selectedSubsection.content}
                            </div>
                            <button 
                                className="text-sm font-semibold text-blue-300 hover:text-blue-200 mt-2" 
                                onClick={handleCloseSection}
                            >
                                Close Section
                            </button>
                        </>
                    )}

                    <div className="mt-8 border-t border-gray-600 pt-6">
                        <h3 className="text-lg font-bold mb-2 text-[#faecc4]">2. Search Handbook by Topic</h3>
                        <p className="text-gray-300 mb-2">Enter a topic to find relevant language in the handbook.</p>
                        <textarea
                            className="w-full min-h-[80px] p-2 rounded-md text-black"
                            placeholder="e.g., Confidentiality, Remote Work, Discipline..."
                            value={handbookTopicQuery}
                            onChange={(e) => setHandbookTopicQuery(e.target.value)}
                        />
                        <button
                            onClick={handleTopicSearch}
                            disabled={isAnalyzingTopic}
                            className="bg-blue-700 text-white font-semibold px-5 py-2 mt-2 rounded-lg shadow hover:bg-blue-800 disabled:bg-gray-500"
                        >
                            {isAnalyzingTopic ? 'Analyzing...' : 'Analyze Handbook'}
                        </button>

                        {/* CORRECTED SEARCH RESULTS DISPLAY */}
                        {handbookTopicResults && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-lg">Search Results for "{handbookTopicQuery}"</h4>
                                    <button onClick={() => setHandbookTopicResults(null)} className="text-sm font-semibold text-blue-300 hover:text-blue-200">Close</button>
                                </div>
                                {handbookTopicResults.length > 0 ? (
                                    handbookTopicResults.map((result) => (
                                        <div key={result.id} className="mt-2 p-3 bg-gray-700 rounded-lg">
                                            <h5 className="font-bold text-blue-300">{result.id} {result.title}</h5>
                                            <div className="mt-1 border-t border-gray-600 pt-1">
                                                <HighlightedText text={result.content} highlight={handbookTopicQuery} />
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
            <HandbookComparisonCard apiKey={apiKey} handbookContent={handbookContent} />
            <HandbookAuditCard /> 
        </div>
    );
}
