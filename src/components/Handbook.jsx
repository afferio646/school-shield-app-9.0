import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, AlertCircle, TrendingUp, ClipboardCheck, ChevronDown } from "lucide-react";

import PolicyWatchtower from './PolicyWatchtower.jsx';
import HandbookComparisonCard from './HandbookComparisonCard.jsx';

// (Helper components can remain as they are)
function HighlightedText({ text, highlight }) { /* ... */ }
function HandbookAuditCard() { /* ... */ }
function SectionHeader({ icon, title }) { /* ... */ }

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
            
            <HandbookVulnerabilitiesCardComponent />
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
