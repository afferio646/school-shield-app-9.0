import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, AlertCircle, TrendingUp, ClipboardCheck, ChevronDown } from "lucide-react";

import PolicyWatchtower from './PolicyWatchtower.jsx';
import HandbookComparisonCard from './HandbookComparisonCard.jsx';

// Helper component for search result highlighting
function HighlightedText({ text, highlight }) {
    if (!highlight || !text) return <p className="text-sm leading-relaxed whitespace-pre-line">{text}</p>;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (<p className="text-sm leading-relaxed whitespace-pre-line">{parts.map((part, i) => regex.test(part) ? <span key={i} className="bg-yellow-300 font-bold text-black px-1 rounded">{part}</span> : part)}</p>);
}

// Full code for the Audit Card
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
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    
    // --- NEW STATE to control the custom dropdown ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const getSubsectionById = (id) => {
        for (const section of handbookContent) {
            const found = section.subsections.find(sub => sub.id === id);
            if (found) return found;
        }
        return null;
    };

    const selectedSubsection = getSubsectionById(selectedSubsectionId);

    // --- NEW LOGIC to close dropdown when clicking outside ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    const handleTopicSearch = () => { /* ... existing handleTopicSearch function ... */ };
    const handleCloseSection = () => { /* ... existing handleCloseSection function ... */ };
    const currentVulnerabilities = selectedSubsection ? (handbookSections(onSectionLinkClick).find(s => s.section.startsWith(selectedSubsection.id.split('.')[0]))?.vulnerabilities || []) : [];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PolicyWatchtower
                // ... existing props
            />

            <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
                <div className="p-6 text-white">
                    <SectionHeader icon={<BookOpen className="text-[#faecc4]" size={26} />} title="Handbook Section Review" />
                    
                    <h3 className="text-lg font-bold mb-2 text-[#faecc4]">1. Review by Section</h3>
                    <label className="block font-medium mb-1 text-gray-200">Select Section to review the entire section language</label>
                    
                    {/* --- REPLACEMENT for the <select> element --- */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-white text-black p-2 rounded shadow flex justify-between items-center"
                        >
                            <span>
                                {selectedSubsection ? `${selectedSubsection.id} ${selectedSubsection.title}` : "-- Select a Section to Review --"}
                            </span>
                            <ChevronDown size={20} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
                                {handbookContent.map(section => (
                                    <div key={section.id}>
                                        <div className="px-3 py-2 text-sm font-bold text-gray-500 bg-gray-100">{section.title}</div>
                                        {section.subsections.map(subsection => (
                                            <button
                                                key={subsection.id}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                                                onClick={() => {
                                                    setSelectedSubsectionId(subsection.id);
                                                    setIsSectionLanguageOpen(true);
                                                    setIsDropdownOpen(false); // Close dropdown on selection
                                                }}
                                            >
                                                {subsection.id} {subsection.title}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* --- END of REPLACEMENT --- */}
                    
                    {isSectionLanguageOpen && selectedSubsection && (
                        <>
                            <div className="bg-gray-800 p-4 rounded-lg mt-4 shadow-inner border border-gray-700 whitespace-pre-line text-gray-200" style={{ maxHeight: "320px", overflowY: "auto" }}>
                                {selectedSubsection.content}
                            </div>
                            <button className="text-sm font-semibold text-blue-300 hover:text-blue-200 mt-2" onClick={handleCloseSection}>
                                Close Section
                            </button>
                        </>
                    )}

                    {selectedSubsection && (
                        <div className="mt-6 border-t border-gray-600 pt-4">
                            {/* ... Vulnerabilities JSX ... */}
                        </div>
                    )}
                    
                    <div className="mt-8 border-t border-gray-600 pt-6">
                        {/* ... Topic Search JSX ... */}
                    </div>
                </div>
            </div>
            
           
            <HandbookVulnerabilitiesCardComponent sections={handbookSections} onSectionLinkClick={onSectionLinkClick} />
            <HandbookComparisonCard apiKey={apiKey} />
            <HandbookAuditCard /> 
          
            {showSuggestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    {/* ... Suggestion Modal JSX ... */}
                </div>
            )}
        </div>
    );
}
