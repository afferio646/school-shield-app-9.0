import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Bell, BookOpen, Shield, AlertCircle, TrendingUp, MessageCircle, Gavel, ChevronLeft, ChevronRight, Calendar, X, Archive, ExternalLink, Search, Menu } from "lucide-react";

// --- COMPONENT IMPORTS ---
import HandbookComparisonCard from './components/HandbookComparisonCard.jsx';
import LegalReferenceJournal from './components/LegalReferenceJournal.jsx';
import ExpandableOption from './components/ExpandableOption.jsx';
import ReviewUpdate from './components/ReviewUpdate.jsx';
import Dashboard from './components/Dashboard.jsx';
import Handbook from './components/Handbook.jsx';
import AlertDetailModal from './components/AlertDetailModal.jsx';
import AttendanceModal from './components/AttendanceModal.jsx';

// --- SECURE API KEY HANDLING ---
const GEMINI_API_KEY = "AIzaSyCYAfKVJ9BTLWHpNLDr0bHDsvYOdWMfIpw";

// --- Helper Components ---

function SectionHeader({ icon, title, children }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
            {children}
        </div>
    );
}

// --- Handbook Section Link Component ---
function SectionLink({ number, onLinkClick, children }) {
    return (
        <button
            className="text-blue-300 underline hover:text-blue-200 font-bold focus:outline-none inline"
            onClick={(e) => {
                e.stopPropagation(); // Prevent parent click events
                onLinkClick(number);
            }}
        >
            {children || `Section ${number}`}
        </button>
    );
}

function LegalLink({ name, onLegalLinkClick }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onLegalLinkClick(name); }}
            className="text-blue-300 underline hover:text-blue-200 font-semibold focus:outline-none inline"
        >
            {name}
        </button>
    );
}

// --- AIContentRenderer ---

function ParsedContent({ text, onSectionLinkClick, onLegalLinkClick }) {
    if (typeof text !== 'string') {
        return text;
    }

    const sectionSrc = 'Section\\s\\d+(?:\\.\\d+)?';
    const caseLawSrc = '\\*[^*]+\\s?v\\.\\s?[^*]+\\*';
    const boldSrc = '\\*\\*.*?\\*\\*';

    const combinedRegex = new RegExp(`(${sectionSrc}|${caseLawSrc}|${boldSrc})`, 'g');

    const sectionRegex = new RegExp(`^${sectionSrc}$`);
    const caseLawRegex = new RegExp(`^${caseLawSrc}$`);
    const boldRegex = new RegExp(`^${boldSrc}$`);

    const parts = text.split(combinedRegex).filter(Boolean);
    const statuteKeywords = ['Act', 'Title', 'Rule', 'Statute', 'Code', 'U.S.C.', 'FERPA', 'IDEA'];

    return (
        <>
            {parts.map((part, i) => {
                if (sectionRegex.test(part)) {
                    const sectionNumber = part.match(/(\d+(\.\d+)?)/)[0];
                    return (
                        <SectionLink key={i} number={sectionNumber} onLinkClick={onSectionLinkClick}>
                            {part}
                        </SectionLink>
                    );
                }
                
                if (caseLawRegex.test(part)) {
                    const caseName = part.slice(1, -1);
                    return <LegalLink key={i} name={caseName} onLegalLinkClick={onLegalLinkClick} />;
                }

                if (boldRegex.test(part)) {
                    const innerText = part.slice(2, -2);
                    if (statuteKeywords.some(keyword => innerText.includes(keyword))) {
                        return <LegalLink key={i} name={innerText} onLegalLinkClick={onLegalLinkClick} />;
                    }
                    return <strong key={i} className="text-[#faecc4]">{innerText}</strong>;
                }
                
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}

function AIContentRenderer({ content, onSectionLinkClick, onLegalLinkClick, openOptions, onOptionToggle }) {
    if (!content) return null;

    if (React.isValidElement(content)) {
        return content;
    }

    if (Array.isArray(content)) {
        if (content.length > 0 && typeof content[0] === 'object' && content[0] !== null && 'header' in content[0]) {
            return (
                <div className="text-white space-y-2">
                    {content.map((item, index) => (
                        <p key={index} className="whitespace-pre-line">
                            <strong className="text-[#faecc4]">{item.header}</strong>{' '}
                            <ParsedContent text={item.text} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                        </p>
                    ))}
                </div>
            );
        }
        return (
            <div className="text-white space-y-2">
                {content.map((item, index) => <p key={index}><ParsedContent text={String(item)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></p>)}
            </div>
        );
    }

    if (typeof content === 'object' && content !== null) {
        if (content.recommendationSummary && content.implementationSteps) {
            return (
                <div className="space-y-4">
                    <div className="whitespace-pre-line"><ParsedContent text={content.recommendationSummary} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></div>
                    <div className="border-t border-gray-600 pt-4">
                        <h4 className="font-bold text-lg text-[#faecc4] mb-2">Implementation Steps:</h4>
                        <AIContentRenderer content={content.implementationSteps} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                    </div>
                </div>
            );
        }

        if (content.optionA || content.optionB || content.optionC) {
             return (
                <div className="text-white">
                    {Object.entries(content).map(([key, option]) => {
                         if (key.startsWith('option') && typeof option === 'object' && option !== null) {
                            return (
                                 <ExpandableOption
                                    key={key}
                                    title={option.title}
                                    isOpen={!!openOptions[key]}
                                    onToggle={() => onOptionToggle(key)}
                                >
                                    <AIContentRenderer content={option} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                                </ExpandableOption>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        }

        return (
            <div className="space-y-3 text-white">
                {Object.entries(content).map(([prop, val]) => {
                    if (prop === 'title') return null; 
                    const formattedProp = prop.charAt(0).toUpperCase() + prop.slice(1).replace(/([A-Z])/g, ' $1');

                    if (prop === 'suggestedLanguage') {
                        return (
                            <div key={prop} className="mt-2">
                                <strong className="text-[#faecc4]">{formattedProp}:</strong>
                                <div className="mt-1 p-3 border border-dashed border-gray-500 rounded-md bg-gray-800 italic whitespace-pre-line">
                                    <ParsedContent text={String(val)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <p key={prop}>
                            <strong>{formattedProp}:</strong> <span><ParsedContent text={String(val)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></span>
                        </p>
                    );
                })}
            </div>
        );
    }
    
    if (typeof content === 'string') {
        return (
            <div className="text-white space-y-2">
                {content.split('\n').filter(line => line.trim() !== '').map((line, index) =>
                    <p key={index}><ParsedContent text={line} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} /></p>
                )}
            </div>
        );
    }

    return null;
}

// --- Handbook Section Modal ---
function HandbookSectionModal({ section, onClose }) {
    if (!section) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-3xl w-full text-white border-2 border-blue-400">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
                    <h2 className="text-xl font-bold text-[#faecc4]">{section.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto pr-4 text-gray-200 whitespace-pre-line">
                    {section.content}
                </div>
            </div>
        </div>
    );
}


// --- Handbook Vulnerabilities Card Component ---
function HandbookVulnerabilitiesCard({ sections, onSectionLinkClick }) {
    const [isVulnerabilitiesRevealed, setIsVulnerabilitiesRevealed] = useState(false);
    // REMOVED: The state for the other button is no longer needed.
    // const [isMonitoringSystemRevealed, setIsMonitoringSystemRevealed] = useState(false);

    // (The monitoringProcess array can be removed if not used elsewhere, but it's safe to leave)
    const monitoringProcess = [
        { title: "24/7 Legislative Intelligence", details: "..." },
    ];

    return (
        <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
            <div className="p-6 text-white">
                <SectionHeader icon={<AlertCircle className="text-[#faecc4]" size={26} />} title="IQ Handbook Vulnerabilities" />
                <div className="space-y-3 text-gray-200">
                    <p className="font-semibold">"Real-Time Vulnerability Monitoring - Continuous Policy Protection & Risk Alerts"</p>
                    <p>Dynamically powered surveillance system that continuously monitors federal regulations, state legislation, court decisions, and industry developments to identify emerging vulnerabilities in your current handbook policies.</p>
                </div>
                <div className="mt-6">
                    <button
                        className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800 w-full"
                        onClick={() => setIsVulnerabilitiesRevealed(!isVulnerabilitiesRevealed)}
                    >
                        {isVulnerabilitiesRevealed ? "Close Vulnerabilities" : "Show All Vulnerabilities"}
                    </button>
                    {/* REMOVED: The "Our Continuous Monitoring System" button is gone. */}
                </div>
                {isVulnerabilitiesRevealed && (
                    <div className="mt-4 text-white border-t border-gray-500 pt-4">
                        <b>All Identified Vulnerabilities by Section:</b>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-base">
                            {sections(onSectionLinkClick).map((section, idx) =>
                                section.vulnerabilities.length > 0 ? (
                                    <li key={idx} className="mb-1">
                                        <b>{section.section}:</b>
                                        <ul className="list-disc ml-5">
                                            {section.vulnerabilities.map((vuln, j) => (<li key={j}>{vuln.text}</li>))}
                                        </ul>
                                    </li>
                                ) : null
                            )}
                        </ul>
                    </div>
                )}
                {/* REMOVED: The conditional block for the monitoring system details is also gone. */}
            </div>
        </div>
    );
}

// --- Report Viewer Modal Component ---
const ReportViewerModal = React.memo(function ReportViewerModal({ report, scenarios, onClose, onSectionLinkClick, onLegalLinkClick }) {
    if (!report) return null;

    const [openOptions, setOpenOptions] = React.useState({});
    const handleOptionToggle = useCallback((stepKey, optionKey) => {
        const fullKey = `${stepKey}-${optionKey}`;
        setOpenOptions(prev => ({ ...prev, [fullKey]: !prev[fullKey] }));
    }, []);


    const reportData = scenarios[report.scenarioKey];

    if (!reportData) {
        return (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                 <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-lg w-full text-white">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-red-400">Report Error</h2>
                         <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                     </div>
                     <p className="mt-4">Could not load the report data for "{report.title}". The associated scenario key "{report.scenarioKey}" could not be found.</p>
                 </div>
             </div>
        );
    }

    const StepDetail = ({ title, stepKey, children }) => (
        <div className="p-4 border border-gray-600 rounded-lg bg-gray-800 mb-4">
            <h4 className="font-bold text-lg text-blue-300 mb-2">{`Step ${parseInt(stepKey.replace('step', ''))}: ${title}`}</h4>
            <div className="text-gray-200 text-sm prose-p:my-1 prose-strong:text-white">
                {children}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 py-2">
                    <h2 className="text-2xl font-bold text-white">Incident Report</h2>
                    <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                    <div className="mb-6 border-b border-gray-500 pb-4">
                        <h3 className="text-xl font-bold text-white mb-1">{report.title}</h3>
                        <p className="text-sm text-gray-400">Date Generated: {report.date}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-600 rounded-lg bg-gray-800 mb-4">
                           <h4 className="font-bold text-lg text-blue-300 mb-2">Initial Complaint / Issue</h4>
                           <p className="text-white">{report.issue}</p>
                        </div>
                        {Object.keys(reportData).filter(k => k.startsWith('step')).map(stepKey => (
                            <StepDetail key={stepKey} stepKey={stepKey} title={reportData[stepKey].title}>
                                 <AIContentRenderer
                                    content={reportData[stepKey].content}
                                    onSectionLinkClick={onSectionLinkClick}
                                    onLegalLinkClick={onLegalLinkClick}
                                    openOptions={
                                        Object.fromEntries(
                                            Object.entries(openOptions)
                                            .filter(([k]) => k.startsWith(stepKey))
                                            .map(([k, v]) => [k.split('-')[1], v])
                                        )
                                    }
                                    onOptionToggle={(optionKey) => handleOptionToggle(stepKey, optionKey)}
                                />
                            </StepDetail>
                          ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- Archived Reports Card Component ---
function ArchivedReportsCard({ reports, onViewReport }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleUploadClick = (e, reportId) => {
        e.stopPropagation();
        console.log(`Upload button clicked for report ID: ${reportId}`);
    };

    return (
        <div className="shadow-2xl border-0 rounded-2xl mt-6" style={{ background: "#4B5C64" }}>
            <div className="p-6" style={{ color: "#fff" }}>
                <h2 className="text-xl font-bold" style={{ color: "#fff" }}>Archived Incident Reports</h2>
                <div className="mt-4">
                    <button
                        className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800 w-full"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? "Close" : "Reports"}
                    </button>
                </div>
                {isOpen && (
                    <div className="mt-4 border-t border-gray-500 pt-4 space-y-2 max-h-60 overflow-y-auto">
                        {reports.length > 0 ? reports.map(report => (
                            <div
                                key={report.id}
                                className="p-3 bg-gray-700 rounded-lg flex items-center justify-between"
                            >
                                <div
                                    className="flex-grow cursor-pointer"
                                    onClick={() => onViewReport(report)}
                                >
                                    <p className="font-semibold">{report.title}</p>
                                    <p className="text-xs text-gray-400">Date: {report.date}</p>
                                </div>
                                <button
                                    onClick={(e) => handleUploadClick(e, report.id)}
                                    className="ml-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                                >
                                    <Archive size={12} />
                                    Upload
                                </button>
                            </div>
                        )) : <p>No reports archived yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Page Components ---

// --- Risk Assessment & Mitigation Center Component --- //
function RiskAssessmentCenter({ handbookText, apiKey, handbookSectionLanguage, onSectionLinkClick, onLegalLinkClick }) {
    const [issue, setIssue] = useState("");
    const [responseGenerated, setResponseGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeLoader, setActiveLoader] = useState(null);
    const [viewMode, setViewMode] = useState('form');
    const [selectedScenarioKey, setSelectedScenarioKey] = useState(null);
    const [openSteps, setOpenSteps] = useState({});
    const [openSubOptions, setOpenSubOptions] = useState({});
    const [archivedReports, setArchivedReports] = useState([
        { id: 1, title: "Parent complaint about unfair suspension without notice", date: "August 12, 2025", scenarioKey: 'parentComplaint', issue: "Parent complaint about unfair suspension without notice" },
        { id: 2, title: "Non-renewed faculty member wants to use sick days as vacation", date: "August 10, 2025", scenarioKey: 'facultyLeave', issue: "Non-renewed faculty member wants to use sick days as vacation before departure." }
    ]);
    const [viewedReport, setViewedReport] = useState(null);
    const [generatedSteps, setGeneratedSteps] = useState(null);
    const [fallbackMessage, setFallbackMessage] = useState("");
    const stepRefs = useRef({});

    const handleSubOptionToggle = useCallback((stepKey, optionKey) => {
        const fullKey = `${stepKey}-${optionKey}`;
        setOpenSubOptions(prev => ({
            ...prev,
            [fullKey]: !prev[fullKey]
        }));
    }, []);

    const scenarios = useMemo(() => ({
        parentComplaint: {
            step1: { title: "Classify the Issue", content: [
                { header: "Issue Type:", text: "Parent Complaint" },
                { header: "Summary:", text: "Parent feels blindsided by disciplinary action (suspension). Requests policy change and apology." },
                { header: "Stakeholders:", text: "Parent, Student, Faculty, Admin Team" }
            ]},
            step2: { title: "Match Handbook & Policies", content: [
                { header: "Relevant Section:", text: <><SectionLink number="3.4" onLinkClick={onSectionLinkClick} /> – Disciplinary Action Policy</> },
                { header: "Full Section Language:", text: handbookSectionLanguage["3. The Employment Relationship"] },
                { header: "Policy Gap:", text: "No clear mandate about timing of parental notification. No explicit appeal process defined." }
            ]},
            step3: { title: "Initial Risk Assessment", content: [
                { header: "Risk Tier:", text: "Moderate" },
                { header: "Justification:", text: "Policy ambiguity + use of legal language by parent (e.g. “violates rights”). High potential for reputational or legal escalation without documentation." }
            ]},
            step4: { title: "Administrator Response Options", content: <> <ExpandableOption title="Option A – Supportive & Investigative"> <p>“We are actively reviewing this matter to ensure all disciplinary steps align with our handbook. We appreciate your patience and will provide a full review soon.”</p> <p><strong>Policy Match:</strong> <SectionLink number="3.4" onLinkClick={onSectionLinkClick} /> – Disciplinary Action Policy</p> <p><strong>Risk Score:</strong> Low</p> <p><strong>Legal Reference:</strong> *Smith v. Westbrook Charter (2020)*, courts emphasized that prompt review and acknowledgment of parental concerns significantly reduced liability exposure.</p> <p><strong>Recommendation:</strong> Proceed. No legal escalation needed.</p> </ExpandableOption> <ExpandableOption title="Option B – Procedural + Soft Acknowledgment"> <p>“Our current disciplinary policy allows administrative discretion. While no violation occurred, we recognize communication could be improved.”</p> <p><strong>Policy Match:</strong> <SectionLink number="3.4" onLinkClick={onSectionLinkClick} /> – Disciplinary Action Policy</p> <p><strong>Risk Score:</strong> Moderate</p> <p><strong>Legal Reference:</strong> *Mason v. Eastside Prep (2021)*, ambiguity in school policy and failure to proactively address parent concerns resulted in the issue escalating to the board and gaining media attention.</p> <p><strong>Recommendation:</strong> Use cautiously. Consider offering a follow-up to reduce friction.</p> </ExpandableOption> <ExpandableOption title="Option C – Firm & Final"> <p>“The suspension followed established policy and is final. No further action is required by the school.”</p> <p><strong>Policy Match:</strong> <SectionLink number="3.4" onLinkClick={onSectionLinkClick} /> – General Interpretation</p> <p><strong>Risk Score:</strong> High</p> <p><strong>Legal Reference:</strong> *Parent v. Beacon Hill Christian (2020)*, a rigid response without acknowledgment of parental concern resulted in negative publicity and a costly settlement due to failure to follow communication best practices.</p> <p><strong>Recommendation:</strong> Not advised. May escalate tensions and introduce legal or reputational risk.</p> </ExpandableOption> </> },
            step5: { title: "Projected Complainant Reactions", content: <> <ExpandableOption title="Option A"> <p><strong>Likely Response:</strong> Parent appreciates the acknowledgment and feels heard. May request a brief meeting for clarity, but escalation is unlikely.</p> <p><strong>School Risk:</strong> Low – Positive tone and willingness to investigate usually results in resolution without further action.</p> <p><strong>Legal Reference:</strong> *Doe v. Heritage Academy (2019)* – School protected after showing procedural review in response to parental concern.</p> </ExpandableOption> <ExpandableOption title="Option B"> <p><strong>Likely Response:</strong> Parent feels partially heard but remains concerned. May request documentation or a policy review meeting. Possible follow-up to school board.</p> <p><strong>School Risk:</strong> Moderate – While language is neutral, absence of apology or proactive follow-up could be perceived as dismissive. Reputation risk increases with repeat complaints.</p> <p><strong>Legal Reference:</strong> *Mason v. Eastside Prep (2021)* – Lack of communication clarity contributed to prolonged parent conflict and board involvement.</p> </ExpandableOption> <ExpandableOption title="Option C"> <p><strong>Likely Response:</strong> Parent views this as stonewalling. Likely to escalate to school board or external legal advisory. May take issue to social media or local press, claiming rights were ignored.</p> <p><strong>School Risk:</strong> High – This tone invites resistance, lacks empathy, and contradicts best practices for early-stage resolution. Serious PR and legal exposure possible.</p> <p><strong>Legal Reference:</strong> *Parent v. Beacon Hill Christian (2020)* – Firm denial without engagement led to settlement due to public backlash and lack of documentation.</p> </ExpandableOption> </> },
            step6: {
                title: "Final Recommendation & Action Plan",
                content: {
                    recommendationSummary: `**Recommended Option:** Option A\n**Why:** Demonstrates due diligence, protects school reputation, and aligns with a restorative tone. Legal precedent supports early review and acknowledgment of parental concerns.\n**Confidence Level:** High\n**Legal Review Advised:** Not required unless the parent submits a formal complaint or legal threat.`,
                    implementationSteps: [
                        "1. **Acknowledge:** Immediately contact the parent to acknowledge receipt of their complaint and inform them that a review is underway.",
                        "2. **Investigate:** Interview all relevant staff and review any documentation related to the suspension.",
                        "3. **Document:** Create a timeline of events and a summary of findings from the investigation.",
                        "4. **Communicate:** Schedule a follow-up meeting with the parent to discuss the findings and the school's position.",
                        "5. **Policy Review:** Flag the 'Disciplinary Action Policy' for the next handbook review to add clarity regarding parental notification timelines."
                    ]
                }
            }
        },
        facultyLeave: {
            step1: { title: "Classify the Issue", content: [
                { header: "Issue Type:", text: "Employee Leave/Separation Inquiry" },
                { header: "Summary:", text: "A non-renewed faculty member requests to use accrued sick days as vacation prior to their final day of employment." },
                { header: "Stakeholders:", text: "Faculty Member, Head of School, Director of Finance/HR." }
            ]},
            step2: { title: "Match Handbook & Policies", content: [
                { header: "Relevant Sections:", text: <><SectionLink number="4" onLinkClick={onSectionLinkClick}>Section 4</SectionLink> – Compensation Policies & <SectionLink number="5" onLinkClick={onSectionLinkClick}>Section 5</SectionLink> – Employee Benefit Programs</> },
                { header: "Full Section Language:", text: `--- SECTION 4: COMPENSATION POLICIES ---\n${handbookSectionLanguage["4. Compensation Policies"]}\n\n--- SECTION 5: EMPLOYEE BENEFIT PROGRAMS ---\n${handbookSectionLanguage["5. Employee Benefit Programs"]}` },
                { header: "Policy Clarity:", text: "The policy is clear. Sick leave is for specific, approved reasons and is not a cash benefit or interchangeable with vacation, which faculty do not receive." }
            ]},
            step3: { title: "Initial Risk Assessment", content: [
                { header: "Risk Tier:", text: "Low to Moderate" },
                { header: "Justification:", text: "The policy is clear, reducing legal risk. However, the employee is being non-renewed, creating a sensitive situation. A poorly handled response could lead to a baseless wrongful termination claim or negative sentiment. The risk is primarily in relationship management." }
            ]},
            step4: { title: "Administrator Response Options", content: <> <ExpandableOption title="Option A – Firm, Policy-Based, & Supportive"> <p>“Thank you for your inquiry. Per our employee handbook (<SectionLink number="5" onLinkClick={onSectionLinkClick}>Section 5</SectionLink>), sick leave is designated for illness and other specified emergencies and is not convertible to vacation time. Additionally, the handbook states that unused sick leave is not paid out upon separation (<SectionLink number="4.3" onLinkClick={onSectionLinkClick} />). We can, however, schedule a meeting to discuss your final pay and benefits transition to ensure a smooth departure.”</p> <p><strong>Policy Match:</strong> <SectionLink number="4.3" onLinkClick={onSectionLinkClick} />, <SectionLink number="5" onLinkClick={onSectionLinkClick}>Section 5</SectionLink></p> <p><strong>Risk Score:</strong> Low</p> <p><strong>Legal Reference:</strong> *Johnson v. Independent School District No. 4*, where courts upheld an employer's right to enforce clear, written leave policies, especially when distinguishing between sick and vacation leave. Emphasizes the importance of consistent policy application.</p> <p><strong>Recommendation:</strong> Proceed. This is the most direct and legally sound approach.</p> </ExpandableOption> <ExpandableOption title="Option B – Accommodating / Exception-Based"> <p>“While our policy doesn't typically allow for this, we can make an exception in this case and allow you to use a portion of your sick leave before your departure.”</p> <p><strong>Policy Match:</strong> N/A - Contradicts policy</p> <p><strong>Risk Score:</strong> High</p> <p><strong>Legal Reference:</strong> *Davis v. Charter School Partners*, where making an exception for one employee created a precedent that the school was later forced to honor for others, leading to significant unplanned costs. Inconsistent policy application creates risk of discrimination claims.</p> <p><strong>Recommendation:</strong> Not advised. Creates a dangerous precedent and undermines the handbook.</p> </ExpandableOption> <ExpandableOption title="Option C – Vague & Deferring"> <p>“We will need to review your request with the business office and will get back to you at a later date.”</p> <p><strong>Policy Match:</strong> N/A</p> <p><strong>Risk Score:</strong> Moderate</p> <p><strong>Legal Reference:</strong> In *Chen v. Academy of Arts*, delaying a clear answer on a separation-related matter was interpreted as evasive, increasing employee frustration and contributing to a constructive discharge claim (though ultimately unsuccessful, it was costly to defend).</p> <p><strong>Recommendation:</strong> Not advised. Delays a clear answer and can create false hope, leading to more frustration.</p> </ExpandableOption> </> },
            step5: { title: "Projected Complainant Reactions", content: <> <ExpandableOption title="Option A"> <p><strong>Likely Response:</strong> Employee may be disappointed but understands the decision is based on established policy, not personal animus. Escalation is unlikely as the policy is clear.</p> <p><strong>School Risk:</strong> Low – The decision is defensible and based on consistent application of written policy.</p> </ExpandableOption> <ExpandableOption title="Option B"> <p><strong>Likely Response:</strong> Employee is satisfied. However, this may create morale issues with other staff who were not granted similar exceptions. Sets a precedent for future requests upon separation.</p> <p><strong>School Risk:</strong> High – Future employees could claim discrimination if not offered the same benefit, undermining the handbook.</p> </ExpandableOption> <ExpandableOption title="Option C"> <p><strong>Likely Response:</strong> Employee becomes anxious and frustrated by the delay. May begin to feel they are being treated unfairly, increasing the likelihood of consulting legal counsel or complaining to other staff.</p> <p><strong>School Risk:</strong> Moderate – The ambiguity and delay can be perceived as weakness or unfair treatment, potentially escalating the situation.</p> </ExpandableOption> </> },
            step6: {
                title: "Final Recommendation & Action Plan",
                content: {
                    recommendationSummary: `**Recommended Option:** Option A\n**Why:** It is clear, consistent, and directly supported by the employee handbook. It respects the employee by providing a direct answer while protecting the school from the significant risks of inconsistent policy application.\n**Confidence Level:** High\n**Legal Review Advised:** Not required unless the employee threatens legal action or alleges the policy is being applied in a discriminatory manner.`,
                    implementationSteps: [
                        "1. **Draft Communication:** Prepare a clear, supportive email based on the language in Option A.",
                        "2. **Send Email:** Send the communication to the faculty member promptly.",
                        "3. **Schedule Meeting:** Proactively offer to schedule a meeting with HR/Finance to discuss their final pay and benefits.",
                        "4. **Document:** Place a copy of the communication in the employee's official file."
                    ]
                }
            }
        }
    }), [onSectionLinkClick, handbookSectionLanguage]);

    const handleScenarioButtonClick = (scenarioKey) => {
        const issueText = archivedReports.find(r => r.scenarioKey === scenarioKey)?.issue || '';
        setIssue(issueText);
        setResponseGenerated(false);
        setGeneratedSteps(null);
        setOpenSteps({});
        setOpenSubOptions({}); // Reset sub-option memory
        setViewMode('demo');
        setSelectedScenarioKey(scenarioKey);
    };

   const handleGenerate = async (isUpdate = false) => {
    if (!issue) return;

    setLoading(true);
    setActiveLoader(isUpdate ? 'update' : 'new');
    if (!isUpdate) {
        setResponseGenerated(false);
        setGeneratedSteps(null);
        setOpenSteps({});
        setOpenSubOptions({}); // Reset sub-option memory
    }
    setFallbackMessage("");

    if (viewMode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (selectedScenarioKey && scenarios[selectedScenarioKey]) {
            setGeneratedSteps(scenarios[selectedScenarioKey]);
        } else {
            setGeneratedSteps({ error: "Could not find demo scenario." });
        }
        setResponseGenerated(true);
        setLoading(false);
        setActiveLoader(null);
        return;
    }

    setViewMode('live');
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        setGeneratedSteps({ error: "API key is not configured. Please add your API key to the App.jsx file." });
        setResponseGenerated(true);
        setLoading(false);
        setActiveLoader(null);
        return;
    }

    const sourceMaterials = handbookText;

    const prompt = `
        Role: You are an expert K-12 risk assessment analyst and legal advisor. Your function is to analyze a scenario and populate a JSON object based on provided source materials. Your tone is professional, clear, and authoritative. Your analysis must be robust and detailed, mirroring the complexity of a real-world legal and administrative consultation for a school leader.
        Task: Read the User-Provided Scenario and the Source Materials. Populate a JSON object that strictly follows the provided schema.
        CRITICAL RULES:
        1.  Your entire response MUST be only the populated JSON object. No other text.
        2.  For 'legalReference', you MUST follow this **three-step internal process**:
            **Step A: Identify Legal Concepts and relevant Keywords used in the issue or complaint.** First, analyze the 'User-Provided Scenario' and then identify the core legal concepts involved using the keywords relevant to the complaint or issue (e.g., 'pay equity,' 'at-will employment,' 'constructive discharge,' 'harassment.')
            **Step B: Find a School-Specific Case or Statute.** Second, find a real, verifiable court case from a **K-12 public or independent school context** OR a controlling federal/state statute that deals with the concepts from Step A. Your search should prioritize sources like Justia, Casetext, Westlaw, and the Legal Information Institute.
            **Step C: Justify and Format the Selection.** Third, in your final output, you **MUST format the case name in italics by wrapping it in single asterisks** (e.g., *Case Name v. Defendant*) OR **format the statute name in bold by wrapping it in double asterisks** (e.g., **Title IX of the Education Amendments of 1972**), followed by a concise explanation that explicitly connects the legal principle to the complaint or issue.
            **Fallback Rule:** If you cannot find a relevant school-specific case or statute, you MUST state, "No direct K-12 case law was found for this specific issue." and cite the relevant general legal principle. Providing irrelevant references is an absolute failure.
        3.  For 'suggestedLanguage' in Step 4, you MUST provide a full, robust paragraph of professional language suitable for a Head of School to use. Do not use single sentences.
        4.  The output must be as detailed and robust as a professional consultant's report. Do not use placeholder text. Every field must be filled with comprehensive, scenario-specific information.
        5.  When referencing a handbook policy, use the format "Section X.Y". The user interface will automatically link this text.
        6.  **For Steps 1, 2, 3:** The 'content' MUST be an array of objects, each with a 'header' key (e.g., "Issue Type:") and a 'text' key (e.g., "Parent Complaint").
        7.  **For Step 4 & 5:** The 'content' must be an object with keys "optionA", "optionB", "optionC". Each option must be an object with its own title and various text properties. The projected reactions in Step 5 must be nuanced and explain potential consequences.
        8.  **For Step 6:** The 'recommendationSummary' MUST be a string formatted with bolded headers like this: "**Recommended Option:** [Option]\\n**Why:** [Explanation]\\n**Confidence Level:** [Level]\\n**Legal Review Advised:** [Yes/No and when]". The 'implementationSteps' MUST be a clear, actionable checklist as an array of strings, with each string being a complete sentence for a single step, prefixed with its number (e.g., "1. Do this first.").
        9.  **NEW CRITICAL RULE:** When you find a handbook policy in the source material like "2.4 Non-Discrimination and Harassment", your response MUST ONLY use the section number format (e.g., "Section 2.4"). DO NOT include the policy title (like "Non-Discrimination and Harassment") or repeat the section number in your output.
        10. **DO NOT INVENT SPECIFIC DETAILS.** Your response must ONLY use information from the "User-Provided Scenario." Do not add specific names (e.g., "Jane Doe"), dates (e.g., "October 26, 2023"), or locations unless they are in the user's query. If details are needed but not provided, use generic placeholders like "[Complainant Name]," "[Date of Incident]," or "[Location]."
        --- START OF SOURCE MATERIALS ---
        ${sourceMaterials}
        --- END OF SOURCE MATERIALS ---
        User-Provided Scenario: "${issue}"
    `;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            "step1": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { type: "ARRAY", items: { type: "OBJECT", properties: { "header": { "type": "STRING" }, "text": { "type": "STRING" } }, required: ["header", "text"] } } }, required: ["title", "content"] },
            "step2": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { type: "ARRAY", items: { type: "OBJECT", properties: { "header": { "type": "STRING" }, "text": { "type": "STRING" } }, required: ["header", "text"] } } }, required: ["title", "content"] },
            "step3": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { type: "ARRAY", items: { type: "OBJECT", properties: { "header": { "type": "STRING" }, "text": { "type": "STRING" } }, required: ["header", "text"] } } }, required: ["title", "content"] },
            "step4": {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING" },
                    "content": {
                        type: "OBJECT",
                        properties: {
                            "optionA": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "suggestedLanguage": { "type": "STRING" }, "policyMatch": { "type": "STRING" }, "riskScore": { "type": "STRING" }, "legalReference": { "type": "STRING" }, "recommendation": { "type": "STRING" } }, required: ["title", "suggestedLanguage", "policyMatch", "riskScore", "legalReference", "recommendation"] },
                            "optionB": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "suggestedLanguage": { "type": "STRING" }, "policyMatch": { "type": "STRING" }, "riskScore": { "type": "STRING" }, "legalReference": { "type": "STRING" }, "recommendation": { "type": "STRING" } }, required: ["title", "suggestedLanguage", "policyMatch", "riskScore", "legalReference", "recommendation"] },
                            "optionC": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "suggestedLanguage": { "type": "STRING" }, "policyMatch": { "type": "STRING" }, "riskScore": { "type": "STRING" }, "legalReference": { "type": "STRING" }, "recommendation": { "type": "STRING" } }, required: ["title", "suggestedLanguage", "policyMatch", "riskScore", "legalReference", "recommendation"] }
                        },
                        required: ["optionA", "optionB", "optionC"]
                    }
                },
                required: ["title", "content"]
            },
            "step5": {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING" },
                    "content": {
                        type: "OBJECT",
                        properties: {
                            "optionA": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "likelyResponse": { "type": "STRING" }, "schoolRisk": { "type": "STRING" }, "legalReference": { "type": "STRING" } }, required: ["title", "likelyResponse", "schoolRisk", "legalReference"] },
                            "optionB": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "likelyResponse": { "type": "STRING" }, "schoolRisk": { "type": "STRING" }, "legalReference": { "type": "STRING" } }, required: ["title", "likelyResponse", "schoolRisk", "legalReference"] },
                            "optionC": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "likelyResponse": { "type": "STRING" }, "schoolRisk": { "type": "STRING" }, "legalReference": { "type": "STRING" } }, required: ["title", "likelyResponse", "schoolRisk", "legalReference"] }
                        },
                        required: ["optionA", "optionB", "optionC"]
                    }
                },
                required: ["title", "content"]
            },
            "step6": {
                type: "OBJECT",
                properties: {
                    "title": { "type": "STRING" },
                    "content": {
                        type: "OBJECT",
                        properties: {
                            "recommendationSummary": { "type": "STRING" },
                            "implementationSteps": { "type": "ARRAY", "items": { "type": "STRING" } }
                        },
                        required: ["recommendationSummary", "implementationSteps"]
                    }
                },
                required: ["title", "content"]
            }
        },
        required: ["step1", "step2", "step3", "step4", "step5", "step6"]
    };

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 503) {
            setFallbackMessage("The live AI model is temporarily unavailable. Displaying a pre-built demonstration scenario.");
            const scenarioKey = 'parentComplaint'; // Default fallback
            setGeneratedSteps(scenarios[scenarioKey]);
            setViewMode('demo');
            setResponseGenerated(true);
            return;
        }

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API request failed: ${response.status} - ${errorBody?.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            const parsedSteps = JSON.parse(jsonText);
            setGeneratedSteps(parsedSteps);
            setResponseGenerated(true);
        } else {
            throw new Error("Invalid response structure from API.");
        }
    } catch (error) {
        console.error("Error generating AI response:", error);
        setGeneratedSteps({ error: `Failed to generate AI response. ${error.message}. Please check your API key and network connection.` });
        setResponseGenerated(true);
    } finally {
        setLoading(false);
        setActiveLoader(null);
    }
};

    const handleStepToggle = (stepKey) => {
        const isOpening = !openSteps[stepKey];
        setOpenSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));

        if (isOpening) {
            setTimeout(() => {
                stepRefs.current[stepKey]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }, 300);
        }
    };

    const handleCloseAnalysis = () => {
        setResponseGenerated(false);
        setGeneratedSteps(null);
        setIssue("");
        setSelectedScenarioKey(null);
        setOpenSteps({});
        setOpenSubOptions({}); // Reset sub-option memory
    };

    const StepCard = React.memo(React.forwardRef(function StepCard({ title, stepKey, children, isOpen, onToggle, onLegalLinkClick, onSectionLinkClick, openSubOptions, onSubOptionToggle }, ref) {
        const [isAnalyzing, setIsAnalyzing] = useState(false);

        const handleToggle = () => {
            if (isOpen) {
                onToggle();
            } else {
                setIsAnalyzing(true);
                setTimeout(() => {
                    setIsAnalyzing(false);
                    onToggle();
                }, 750);
            }
        };

        const buttonText = isOpen ? "Close" : (isAnalyzing ? "Analyzing..." : "Analyze");
        const stepNumber = parseInt(stepKey.replace('step', ''));

        const renderContent = () => {
             return (
                 <AIContentRenderer
                    content={children}
                    onSectionLinkClick={onSectionLinkClick}
                    onLegalLinkClick={onLegalLinkClick}
                    openOptions={
                        Object.fromEntries(
                            Object.entries(openSubOptions)
                            .filter(([k]) => k.startsWith(stepKey))
                            .map(([k, v]) => [k.split('-')[1], v])
                        )
                    }
                    onOptionToggle={(optionKey) => onSubOptionToggle(stepKey, optionKey)}
                 />
             );
        };

        return (
            <div ref={ref}>
                <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
                    <div className="p-6 space-y-4 rounded-2xl" style={{ color: "#fff" }}>
                        <h2 className="text-xl font-semibold" style={{ color: "#faecc4" }}>{`Step ${stepNumber}: ${title}`}</h2>

                        {isOpen && (
                             <div className="border-t border-gray-600 pt-4">
                                 {renderContent()}
                                 {stepKey === 'step6' && (
                                     <div className="border-t border-gray-600 mt-6 pt-6">
                                         <h3 className="text-lg font-semibold text-[#faecc4] mb-2 flex items-center"><Gavel className="w-5 h-5 mr-2"/>Get Direct Legal Help</h3>
                                         <div className="mb-3 text-sm"> Reach out for legal advice about this issue. Begin by adding a brief overview below, and click submit to schedule a phone conference.<br /> <span className="text-blue-400 text-xs">(Annual Legal Counsel Credits will be applied if applicable.)</span> </div>
                                         <textarea className="w-full min-h-[100px] border rounded-md mb-2 p-2 text-black" placeholder={`Add any additional details for the legal team regarding: "${issue}"`} style={{ background: "#fff", border: "2px solid #faecc4" }} />
                                         <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg mt-2" > Submit &amp; Schedule Call </button>
                                     </div>
                                 )}
                             </div>
                        )}

                        <div className="flex justify-start mt-4">
                            <button
                                onClick={handleToggle}
                                disabled={isAnalyzing}
                                className={`px-5 py-2 font-semibold text-white rounded-md shadow-md transition-all ${isAnalyzing ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }));

    useEffect(() => {
        setIssue("");
        setResponseGenerated(false);
        setGeneratedSteps(null);
        setFallbackMessage("");
        setViewMode('form');
        setSelectedScenarioKey(null);
        setOpenSteps({});
        setOpenSubOptions({}); // Reset sub-option memory
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto text-base">
            <h1 className="text-3xl font-bold text-center">IQ Risk Assessment Center</h1>

            <div className="flex justify-center gap-2 mb-4">
                <button onClick={() => handleScenarioButtonClick('parentComplaint')} className={`px-4 py-2 rounded-md ${selectedScenarioKey === 'parentComplaint' ? 'bg-blue-700 text-white' : 'bg-gray-300 text-black'}`}>Parent Complaint Demo</button>
                <button onClick={() => handleScenarioButtonClick('facultyLeave')} className={`px-4 py-2 rounded-md ${selectedScenarioKey === 'facultyLeave' ? 'bg-blue-700 text-white' : 'bg-gray-300 text-black'}`}>Faculty Leave Demo</button>
            </div>

            <div className="shadow-2xl border-2 border-blue-100 rounded-2xl" style={{ background: "#4B5C64" }}>
                <div className="p-6 space-y-4 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
                    <label className="block font-medium">Describe Details of the Complaint or Issue - (Allow 30 seconds for the comprehensive Analysis)</label>
                    <textarea
                        className="w-full min-h-[140px] border-2 rounded-xl shadow-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 p-2 text-black"
                        style={{
                            background: "#fff",
                            borderColor: "#fff",
                            boxShadow: "0 6px 32px 0 rgba(60,60,60,0.10), 0 1.5px 8px 0 rgba(60,60,60,0.08)"
                        }}
                        placeholder="Describe a new incident here or select a scenario above..."
                        value={issue}
                        onChange={(e) => {
                            setIssue(e.target.value);
                            setSelectedScenarioKey(null);
                            setViewMode('live');
                        }}
                    />

                    <div className="flex justify-center gap-4 mt-4">
                        {responseGenerated ? (
                            <button
                                onClick={handleCloseAnalysis}
                                className="px-6 py-2 text-lg font-semibold text-white rounded-md shadow-md bg-red-600 hover:bg-red-700"
                                disabled={loading}
                            >
                                Close
                            </button>
                        ) : (
                            <button
                                onClick={() => handleGenerate(false)}
                                disabled={loading || !issue}
                                className={`px-6 py-2 text-lg font-semibold text-white rounded-md shadow-md transition-colors ${loading || !issue ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {loading && activeLoader === 'new' ? "Analyzing..." : "Analyze New Issue"}
                            </button>
                        )}
                        <button
                            onClick={() => handleGenerate(true)}
                            disabled={loading || !issue || !responseGenerated}
                            className={`px-6 py-2 text-lg font-semibold text-white rounded-md shadow-md transition-colors ${loading || !issue || !responseGenerated ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                        >
                             {loading && activeLoader === 'update' ? "Analyzing..." : "Update & Analyze"}
                        </button>
                    </div>
                </div>
            </div>

            {fallbackMessage && (
                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                    <p className="font-bold">Notice</p>
                    <p>{fallbackMessage}</p>
                </div>
            )}

            {responseGenerated && generatedSteps && (
                <div className="space-y-6">
                    {generatedSteps.error ? (
                         <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                             <p className="font-bold">Error</p>
                             <p>{generatedSteps.error}</p>
                         </div>
                    ) : (
                        Object.keys(generatedSteps).map((stepKey) => (
                            generatedSteps[stepKey] && generatedSteps[stepKey].title && (
                                <StepCard
                                    ref={el => stepRefs.current[stepKey] = el}
                                    key={stepKey}
                                    stepKey={stepKey}
                                    title={generatedSteps[stepKey].title}
                                    isOpen={!!openSteps[stepKey]}
                                    onToggle={() => handleStepToggle(stepKey)}
                                    onLegalLinkClick={onLegalLinkClick}
                                    onSectionLinkClick={onSectionLinkClick}
                                    openSubOptions={openSubOptions}
                                    onSubOptionToggle={handleSubOptionToggle}
                                >
                                    {generatedSteps[stepKey].content}
                                </StepCard>
                            )
                        ))
                    )}
                </div>
            )}


            <ArchivedReportsCard reports={archivedReports} onViewReport={setViewedReport} />
            {viewedReport && <ReportViewerModal report={viewedReport} scenarios={scenarios} onClose={() => setViewedReport(null)} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />}
        </div>
    );
}

function IndustryQuestionsCard({ industryQuestions, onSectionLinkClick, onLegalLinkClick }) {
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [analyzingQuestionId, setAnalyzingQuestionId] = useState(null);
    const [revealedAnswers, setRevealedAnswers] = useState({});

    const topics = [
        "All", "Archived Questions", "Human Resources",
        "Student, Parent & Faculty Handbook Policy Questions", "Governance and Board Topics"
    ];

    const filteredQuestions = selectedTopic === 'All'
        ? industryQuestions
        : industryQuestions.filter(q => q.category === selectedTopic);

    const handleAnalyze = (id) => {
        if (revealedAnswers[id]) {
            setRevealedAnswers(prev => ({ ...prev, [id]: false }));
        } else {
            setAnalyzingQuestionId(id);
            setTimeout(() => {
                setRevealedAnswers(prev => ({ ...prev, [id]: true }));
                setAnalyzingQuestionId(null);
            }, 750);
        }
    };

    return (
        <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
            <div className="p-6">
                <SectionHeader icon={<Archive className="text-[#faecc4]" size={26} />} title="Archived & Industry Questions" />
                <div className="mb-6 text-white font-medium space-y-2">
                    <p>Review previously answered questions or explore common industry topics. New questions you submit above are automatically archived here.</p>
                </div>
                <div className="flex flex-wrap items-start gap-2 mb-6">
                    {topics.map(topic => (
                        <button key={topic} onClick={() => setSelectedTopic(topic)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${selectedTopic === topic ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}>
                            {topic}
                        </button>
                    ))}
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                        <div key={q.id} className="p-4 bg-gray-700 rounded-lg">
                            <p className="font-semibold">{q.question}</p>
                            <div className="mt-3">
                                <button onClick={() => handleAnalyze(q.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg text-xs shadow-md disabled:bg-gray-500"
                                    disabled={analyzingQuestionId === q.id}>
                                    {analyzingQuestionId === q.id ? 'Analyzing...' : (revealedAnswers[q.id] ? 'Close Answer' : 'Show Answer')}
                                </button>
                            </div>
                            {revealedAnswers[q.id] && (
                                <div className="mt-4 p-4 bg-gray-800 rounded-md border-t-2 border-blue-400">
                                    <AIContentRenderer content={q.answer} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                                </div>
                            )}
                        </div>
                    )) : <p className="p-4 text-center text-gray-400">No questions in this category.</p>}
                </div>
            </div>
        </div>
    );
}
    
// --- New Helper for Highlighting Text ---
function HighlightedText({ text, highlight }) {
    if (!highlight || !text) {
        return <p className="text-sm leading-relaxed whitespace-pre-line">{text}</p>;
    }
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <p className="text-sm leading-relaxed whitespace-pre-line">
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span key={i} className="bg-yellow-300 font-bold text-black px-1 rounded">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </p>
    );
}

// --- DATA ---
const handbookSectionLanguage = {
    "1. Introduction": `1.1 Welcome\nAs a member of the faculty and staff of TS (“TS”), employees are a vital part of this educational community, the purpose of which is to help young people achieve their full potential as students and citizens. We hope and expect that employees’ participation in this endeavor will be a rich and rewarding experience and will help the school set the highest standards for personal and professional lives that help promote the school’s mission. \n\n1.2 Purpose of Employee Handbook\nThe purpose of this employee handbook is to provide employees with a general guide to policies, practices, and benefits at TS. If used in conjunction with the Student/Parent Handbook, it will answer some of the more common questions that arise. This handbook is general in nature and not intended to be comprehensive or to address all of the possible applications of, or exceptions to, the general policies and procedures described. TS reserves the right to modify, supplement, or rescind from time to time any of the policies, practices, and benefits described in this handbook as it deems appropriate in TS’s sole discretion with or without notice. Where applicable, the benefit plan documents will govern the administration of TS benefits.\n\nThis employee handbook is not an express or implied contract for employment or any purpose, and nothing contained in this handbook is intended or should be construed as a guarantee of employment or any benefit for any period of time. Except for those faculty and administrators employed pursuant to individual written employment contracts, employment at TS is “at-will,” which means that employment is not for a fixed term and may be terminated by TS or the employee at any time for any reason with or without notice.\n\nAfter reading these policies, any questions should be directed to your supervisor or the Director of Finance. TS employees are expected to follow all TS policies and guidelines. As set forth in more detail herein, failure to comply with the policies set forth in this handbook may result in disciplinary action, up to and including termination of employment. Nothing in this employee handbook is intended to result in non-compliance with applicable laws or regulations. If there is a conflict between this Handbook and any federal, state, or local law or regulation, the law or regulation will govern.`,
    "2. Equal Employment Opportunity Policies and Procedures": `2.1 Equal Employment Opportunity \nTS provides equal employment opportunity to all students, employees and applicants without regard to race, color, religion, sex, age, national origin, sexual orientation, disability, veteran status, family medical history, genetic information or any other legally protected category. This policy governs all student-related decisions and employment decisions, including recruitment, hiring, job assignment, compensation, training, promotion, discipline, transfer, leave-of-absence, access to benefits, layoff, recall, termination and other personnel matters. All student-related and employment-related decisions are based solely upon legitimate, non-discriminatory factors.\n\n2.2 Employment Eligibility \nIn compliance with the Immigration Reform and Control Act of 1986 (“IRCA”) TS is required to verify employment eligibility for each employee hired. New employees must present documentation within three days of hire proving identity and eligibility for employment as required by IRCA. TS will employ only persons who are authorized to work in the United States. Each employee is required to complete an Employment Eligibility Verification Form (Form I-9).\n\n2.3 Americans with Disabilities Act Policy \nTS complies with the Americans with Disabilities Act (“ADA”), as amended by the ADA Amendments Act (“ADAAA”), and all applicable state and local fair employment practices laws, and is committed to providing equal employment opportunities to qualified individuals with disabilities. Consistent with this commitment, TS will provide a reasonable accommodation to disabled applicants and employees if the reasonable accommodation would allow the individual to perform the essential functions of the job, unless doing so would create undue hardship. \n\n2.4 Non-Discrimination and Harassment \nTS is committed to providing a school environment that is free from all forms of discrimination and harassment. Harassment consists of unwelcome conduct, whether verbal, physical or visual, that is based upon or derisive of a person’s race, color, religion, sex, age, national origin, sexual orientation, disability, veteran status, family medical history, genetic information or other legally protected characteristics or conduct, where the unwelcome conduct affects tangible job benefits, unreasonably interferes with an individual’s work performance, or creates an intimidating, hostile, or offensive working environment. All employees have a personal responsibility to keep the work place free of any such harassment.`,
    "3. The Employment Relationship": `3.1 Employment Contracts\nNo representative of TS other than the Head of School has the authority to enter into any employment contract on behalf of TS. Many employees employed by TS as faculty or administrators are employed pursuant to individual employment contracts. All such contracts are in writing and are individual contracts between TS and a particular employee. Renewal of such contracts is at the discretion of TS and typically depends on a variety of factors, including but not limited to, evaluation of performance by a supervisor. Any employee employed by TS who is not a party to such a written contract is employed ‘at will’.\n\n3.2 Background Checks\nThe administration of TS recognizes the importance of maintaining a safe workplace with honest, trustworthy, qualified, reliable and non-violent employees who do not present a risk of serious harm to students, co-employees or others. For the benefit of all employees, the school, and its students, in furthering these interests and enforcing TS’s policies, applicants who have received a conditional offer of employment at TS are required to authorize TS to obtain various background checks in accordance with Indiana law. \n\n3.3 Growth and Evaluation\nTS believes in professional growth, constructive feedback, and positive reinforcement for all of its employees. Supervisors and employees are encouraged to discuss job performance and goals on an ongoing basis. Throughout the year, employees are involved with their supervisors in assessing performance and progress. The cadence of self-assessment will be determined by the direct supervisor.\n\n3.4 Disciplinary Action Policy \nEmployees of TS are expected to perform to the best of their abilities and follow all TS policies and procedures at all times. Failure to adhere to established policies and procedures or other misconduct will result in disciplinary action, up to and including termination of employment. \n\n3.5 Open Door Policy \nIt is the desire of TS to provide good working conditions and maintain harmonious working relationships among employees, as well as between employees and management. In order to correct any work-related problems, management must be informed about them. Therefore, TS has an “open door” problem solving policy. \n\n3.6 Search Policy \nTS holds the highest regard for the students’ interest and your interest in maintaining the privacy of various personal information and materials. For that reason, it is important for you to understand that all items on TS’s property are subject to inspection at any time. \n\n3.7 Whistleblower Policy\nTS is committed to maintaining the highest standards of conduct and ethical behavior and promotes a working environment that values respect, fairness, and integrity. In keeping with this commitment, TS will investigate any suspected fraudulent or dishonest use or misuse of TS’s resources or property by employees, board members, consultants or volunteers.\n\n3.8 Confidentiality \nAll records and information relating to TS employees, its students, or parents are confidential and employees must, therefore, treat all matters accordingly. No the school or the school-related information, including without limitation, documents, notes, files, records, oral information, computer files, or similar materials (except in the ordinary course of performing duties on behalf of the school) may be removed from the school’s premises without permission from TS.\n\n3.9 Document Destruction \nThe Sarbanes-Oxley Act was signed into law on July 30, 2002, and was designed to add new governance standards for the corporate sector to rebuild public trust in publicly held companies. While the majority of this act deals directly with for profit corporations, non-profit corporations must comply with the document destruction policy.`,
    "4. Compensation Policies": `4.1 Employment Classifications\nAll employees matter greatly and there is no intent to declare hierarchies as to value. However, TS must provide basic definitions and categories in order to comply with applicable laws. \n\nMost faculty members are 10-month employees while most non-instructional staff members are 12-month employees, depending on the requirements of their position. Faculty and staff members can also be further classified as exempt or non-exempt, part-time, full time, seasonal or temporary (see below for definition of categories). TS will conduct all compensation practices in compliance with the Fair Labor Standards Act. \n\n4.2 Record of Time Worked\nTS compensates employees for all time worked. All non-exempt employees, including hourly and non-exempt salaried employees, are required to accurately record all time worked (regardless of the location where the work occurs). \n\n4.3 Separation from Employment\nTermination of employment is an inevitable part of personnel activity within any organization, and many of the reasons for termination are routine. Below are examples of some of the most common circumstances under which employment is terminated: \nRESIGNATION: \t Voluntary employment termination initiated by an employee. \n\nDISCHARGE: \t\t Involuntary employment termination initiated by the organization. \n\nRETIREMENT: \t\t Voluntary employment termination initiated by the employee meeting \nage, length of service, and other criteria for retirement from the organization. \n\n4.4 Reference Requests\nAny request for references for a present or former employee should be discussed with the Head of School. This policy does not preclude the use of employee information by the school itself in connection with its own operating needs or the release of such information to government agencies and other appropriate circumstances. \n\n4.5 Payroll Information \nEmployees are paid bi-weekly on every other Friday by direct deposit. The school requires direct deposit of your bi-weekly paycheck into a checking and/or savings account. Biweekly pay details are accessed via an on-line program through the school’s payroll provider.`,
    "5. Employee Benefit Programs": `5.1 Benefit Eligibility\nTS offers a variety of benefit programs to eligible employees, many of which are generally described below. Every effort has been made to ensure the accuracy of the benefits information in this handbook. However, if any inconsistency exists between this handbook and the written plans, policies, or contracts, the actual provisions of each benefit plan will govern. TS reserves the right to amend or terminate any of its benefit plans at any time, in whole or in part, for any reason. \n\n5.2 Summary of Employee Benefits\nGroup Health Insurance, Employer Matching Retirement Plan, Flexible Spending Benefits/Pre-Tax Reimbursements, Life Insurance, Early Retirement Health Benefits, Continuation of Benefits (COBRA), Worker’s Compensation, Unemployment Compensation, Tuition Payments via Payroll Deduction, Advanced Degree Reimbursement.\n\n5.3 Financial Assistance for Faculty/Staff Tuition and Fees\nTuition Remission, Financial Tuition Assistance, Faculty/Student Trips, Faculty/Staff Extended Day Care Services.\n\n5.4 Holidays\nTS observes the following holidays: New Year’s Day, Martin Luther King, Jr. Birthday, Good Friday (p.m.), Memorial Day, Fourth of July, Labor Day, Wednesday before Thanksgiving, Thanksgiving, Friday after Thanksgiving, Christmas Eve, Christmas Day, New Year’s Eve. \n\n5.5 Remote Work\nRemote work is neither a benefit nor an entitlement and in no way changes the terms and conditions of employment. The employee remains obligated to comply with all School rules, policies, practices, and instructions that would apply if the employee were working at the regular School worksite. \n\n5.6 Vacation Time (Non-Instructional Employees Only)\nTwelve month, full-time employees are allowed two weeks paid vacation per year following one year of service from hire date. After 10 years of employment, vacation time is increased to three weeks per year. Non-instructional staff members who work less than twelve months are not entitled to paid vacation.`,
    "6. Code of Conduct": `6.1 Employee Code of Business Conduct and Ethics\nThe School has adopted this Code of Business Conduct and Ethics (the “Code”) applicable to all employees. It is intended to work in conjunction with the Policy on Conflicts of Interest signed by senior administrators, key employees and members of the Board of Trustees (the “Conflict of Interest Policy”). To the extent there is any conflict between the Conflict of Interest Policy and the Code, the Conflict of Interest Policy shall control. \n\n6.2 Employee Dress Code\nIn order to create and maintain an environment as conducive as possible to the attainment of the educational objectives of the school, all employees shall adhere to a reasonable standard of dress and personal grooming. Employees are expected to present a professional image in appearance and dress at all times while performing TS business. \n\n6.3 Student - Employee Relationship \nAs employees of an educational institution, faculty and staff are held to a higher standard by parents, students, colleagues, and members of the public. The school supports and endorses a strict policy of respect toward students and expects employees to act at all times as adult role models. \n\n6.4 Smoking and Drugs\nTS is a smoke-free, tobacco-free environment. This applies to everyone – students, administrators, faculty, staff, contractors, vendors, service personnel, and guests. TS prohibits the use of all tobacco products, including smokeless tobacco and “vapor” devices, on campus and in school vehicles with no exceptions. \n\n6.5 Violence Free Workplace\nTS prohibits possession of guns, firearms, knives, archery-type devices, stun guns, objects capable of firing a projectile, or martial arts devices on TS’s property, including the school’s parking lot.`,
};

const findSectionByNumber = (numberStr) => {
    if (!numberStr) return null;
    const mainSectionNumber = numberStr.split('.')[0];
    const sectionTitle = Object.keys(handbookSectionLanguage).find(key => key.startsWith(mainSectionNumber + '.'));

    if (sectionTitle) {
        return { title: sectionTitle, content: handbookSectionLanguage[sectionTitle] };
    }
    return null;
};

function LEGAL({
    legalQuestion,
    setLegalQuestion,
    submittedLegalQuestion,
    handleLegalQaClose,
    handleLegalQaSubmit,
    isAnalyzingLegal,
    legalAnswer,
    handleSectionLinkClick,
    handleOpenLegalJournal
}) {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
                <div className="p-6">
                    <SectionHeader icon={<Gavel className="text-[#faecc4]" size={26} />} title="IQ Legal Guidance" />
                    <div className="mb-6 text-white space-y-3">
                        <p><strong>Structured Legal Analysis:</strong> Get preliminary legal guidance on complex legal issues.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li><strong>Legal Answer:</strong> A direct, actionable answer.</li>
                            <li><strong>Key References:</strong> Citations to the relevant law.</li>
                            <li><strong>Risk Analysis & Recommendation:</strong> An assessment of the potential pitfalls and clear, immediate next steps.</li>
                        </ul>
                        <p className="text-sm pt-2">This tool provides an initial analysis and guidance based on common legal frameworks, but it is not a substitute for advice from your school's attorney.</p>
                    </div>
                    <p className="mb-2 font-semibold text-white">Enter a legal question or discussion for analysis...</p>
                    <textarea
                        placeholder="e.g. We've received a subpoena from a local law firm demanding all of a student's academic and disciplinary records for a custody case. Do we have to comply immediately?"
                        className="mb-2 min-h-[100px] w-full p-2 rounded-md text-black"
                        style={{ background: "#fff", border: "2px solid #faecc4" }}
                        value={legalQuestion}
                        onChange={e => setLegalQuestion(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 rounded-lg mb-4 py-1"
                        onClick={submittedLegalQuestion ? handleLegalQaClose : handleLegalQaSubmit}
                        disabled={isAnalyzingLegal}
                    >
                        {isAnalyzingLegal ? "Analyzing..." : (submittedLegalQuestion ? "Clear Analysis" : "Submit for Analysis")}
                    </button>

                    {submittedLegalQuestion && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <p className="font-semibold italic text-white mb-4">{`Q: "${submittedLegalQuestion}"`}</p>
                            {isAnalyzingLegal && <p className="text-sm text-yellow-400">Analyzing...</p>}
                            {legalAnswer && (
                                <div className="space-y-4 text-sm">
                                    <div className="p-3 bg-gray-800 rounded-md border-l-4 border-blue-400">
                                        <h4 className="font-bold text-blue-300 mb-1">Legal Guidance</h4>
                                        <AIContentRenderer content={legalAnswer.guidance} onSectionLinkClick={handleSectionLinkClick} onLegalLinkClick={handleOpenLegalJournal} />
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-md border-l-4 border-green-400">
                                        <h4 className="font-bold text-green-300 mb-1">Key References</h4>
                                        <AIContentRenderer content={legalAnswer.references} onSectionLinkClick={handleSectionLinkClick} onLegalLinkClick={handleOpenLegalJournal} />
                                    </div>
                                    <div className={`p-3 bg-gray-800 rounded-md border-l-4 ${legalAnswer.risk.level === 'High' ? 'border-red-400' : 'border-yellow-400'}`}>
                                        <h4 className={`font-bold ${legalAnswer.risk.level === 'High' ? 'text-red-300' : 'text-yellow-300'} mb-1`}>Risk Analysis & Recommendation</h4>
                                        <p className="mb-2"><strong>Level: {legalAnswer.risk.level}</strong></p>
                                        <p className="mb-2">{legalAnswer.risk.analysis}</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            {legalAnswer.risk.recommendation.map((step, i) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
                <div className="p-6">
                    <SectionHeader icon={<Gavel className="text-[#faecc4]" size={26} />} title="Get Direct Legal Help" />
                    <div className="mb-3">
                        Reach out for legal counsel about your issue. Begin by adding a brief overview below, and click submit to schedule a phone conference.<br />
                        <span className="text-blue-400 text-xs">(Annual Legal Counsel Credits will be applied if applicable.)</span>
                    </div>
                    <textarea
                        className="w-full min-h-[100px] border rounded-md mb-2 p-2 text-black"
                        placeholder="Briefly describe your legal issue or question..."
                        style={{ background: "#fff", border: "2px solid #faecc4" }}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg mt-2"
                    >
                        Submit &amp; Schedule Call
                    </button>
                </div>
            </div>
        </div>
    );
}

const HOSQA = ({
    industryQuestions,
    setIndustryQuestions,
    onSectionLinkClick,
    onLegalLinkClick,
    submittedQuestion,
    setSubmittedQuestion,
    isAnalyzing,
    setIsAnalyzing,
    currentAnswer,
    setCurrentAnswer,
    hosQaQuestion,
    setHosQaQuestion
}) => {

    const handleHosQaSubmit = async () => {
        const questionText = hosQaQuestion;
        if (!questionText.trim()) return;

        setSubmittedQuestion(questionText);
        setIsAnalyzing(true);
        setCurrentAnswer(null);
        setHosQaQuestion("");

        const prompt = `You are an expert consultant for K-12 school leaders. Your tone is professional, clear, and authoritative. Analyze the following question and provide a detailed, actionable response. CRITICAL FORMATTING RULES: 1. Structure your response into logical sections. 2. Each section MUST start with a header enclosed in double asterisks, followed by a colon, and then a newline. For example: **Legal Considerations:**\n 3. Provide a comprehensive answer, using single asterisks (*word*) for emphasis if needed. Question: "${questionText}"`;

        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3 }
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API request failed: ${response.status} - ${errorBody?.error?.message || 'Unknown API error'}`);
            }
            const result = await response.json();
            if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Invalid response structure from API.");
            }
            const rawText = result.candidates[0].content.parts[0].text;
            const answerArray = rawText.split(/\*\*(.*?):\*\*\s*\n/).filter(p => p.trim()).reduce((acc, part, i, arr) => {
                if (i % 2 === 0) acc.push({ header: `${part.trim()}:`, text: (arr[i + 1] || "").trim() });
                return acc;
            }, []);

            setCurrentAnswer(answerArray.length ? answerArray : rawText);
            setIndustryQuestions(prev => [{ id: Date.now(), category: 'Archived Questions', question: questionText, answer: rawText }, ...prev]);
        } catch (error) {
            console.error("Error generating AI response:", error);
            setCurrentAnswer(`An error occurred: ${error.message}. Please check your API key and the console.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleHosQaClose = () => {
        setCurrentAnswer(null);
        setSubmittedQuestion(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
                <div className="p-6">
                    <SectionHeader icon={<MessageCircle className="text-[#faecc4]" size={26} />} title="IQ School Leaders Q&A" />
                    <div className="mb-6 text-white font-medium space-y-2">
                        <p>Ask specific questions and receive immediate guidance. The system is connected to various leading-edge knowledge bases and resources to generate comprehensive answers.</p>
                    </div>
                    <textarea
                        placeholder="e.g., What are our obligations under FERPA if a parent requests to see another student's disciplinary records?"
                        className="mb-3 min-h-[120px] w-full p-3 rounded-lg text-black text-base focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                        style={{ background: "#fff", border: "2px solid #ccc" }}
                        value={hosQaQuestion}
                        onChange={e => setHosQaQuestion(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                        onClick={submittedQuestion ? handleHosQaClose : handleHosQaSubmit}
                        disabled={isAnalyzing || (!submittedQuestion && !hosQaQuestion.trim())}>
                        {isAnalyzing ? "Analyzing..." : (submittedQuestion ? "Clear Answer" : "Submit Question")}
                    </button>
                    {submittedQuestion && (
                        <div className="mt-6 p-4 bg-gray-700 rounded-lg shadow-inner">
                            <p className="font-semibold text-lg text-[#faecc4]">{submittedQuestion}</p>
                            {isAnalyzing && <p className="text-sm text-yellow-300 mt-2 animate-pulse">Analyzing...</p>}
                            {currentAnswer && (
                                <div className="mt-4 p-4 bg-gray-800 rounded-md border-t-2 border-blue-400">
                                    <AIContentRenderer content={currentAnswer} onSectionLinkClick={onSectionLinkClick} onLegalLinkClick={onLegalLinkClick} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <IndustryQuestionsCard 
                industryQuestions={industryQuestions} 
                onSectionLinkClick={onSectionLinkClick} 
                onLegalLinkClick={onLegalLinkClick} 
            />
        </div>
    );
};

export default function App() {
      const [page, setPage] = useState('dashboard');
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const [calendarView, setCalendarView] = useState('list');
      const handleSetAttendingEvent = (event, view) => {
      setAttendingEvent(event);
      setCalendarView(view || 'list'); 
};
      const [events, setEvents] = useState([
      
    { 
        date: '2025-09-09', 
        title: 'Head of School - Town Hall',
        eventType: 'School Meeting',
        category: 'Governance',
        location: 'Online',
        description: 'An open forum for faculty and staff to discuss upcoming initiatives and address key issues with the Head of School.' 
    },
    { 
        date: '2025-09-11', 
        title: 'FMLA Guidance Webinar',
        eventType: 'Webinar',
        category: 'Human Resources, Legal',
        location: 'Online',
        description: 'This session provides an overview of the Family and Medical Leave Act (FMLA), focusing on compliance requirements for independent schools.'
    },
    { 
        date: '2025-09-15', 
        title: 'Board of Trustees Meeting',
        eventType: 'School Meeting',
        category: 'Governance, Finance',
        location: 'Online',
        description: 'Regularly scheduled meeting for the Board of Trustees to review financial reports, strategic goals, and committee updates.'
    },
    { 
        date: '2025-09-25', 
        title: 'ADA Legal Guidance Webinar',
        eventType: 'Webinar',
        category: 'Legal, Student Support',
        location: 'Online',
        description: 'Explore best practices for ensuring your school complies with the Americans with Disabilities Act (ADA) for both students and employees.'
    },
    { 
        date: '2025-10-20', 
        title: 'Weekend Workshop Conference',
        eventType: 'Conference',
        category: 'All',
        location: 'Online',
        description: 'The premier professional development and networking event for independent school leaders.' 
    }
]);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestedUpdate, setSuggestedUpdate] = useState("");
    const suggestionSectionRef = useRef("");
    const [selectedSection, setSelectedSection] = useState("1. Introduction");
    const [isSectionLanguageOpen, setIsSectionLanguageOpen] = useState(false);
    const [modalSection, setModalSection] = useState(null);
    const [viewedAlert, setViewedAlert] = useState(null);
    const [attendingEvent, setAttendingEvent] = useState(null); 
    
    // Q&A State
    const [hosQaQuestion, setHosQaQuestion] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [submittedQuestion, setSubmittedQuestion] = useState(null);

    // Legal Q&A State
    const [legalQuestion, setLegalQuestion] = useState("");
    const [isAnalyzingLegal, setIsAnalyzingLegal] = useState(false);
    const [submittedLegalQuestion, setSubmittedLegalQuestion] = useState(null);
    const [legalAnswer, setLegalAnswer] = useState(null);

    // Handbook Topic Search State
    const [handbookTopicQuery, setHandbookTopicQuery] = useState("");
    const [handbookTopicResults, setHandbookTopicResults] = useState(null);
    const [isAnalyzingTopic, setIsAnalyzingTopic] = useState(false);

    // Modal State
    const [legalJournalQuery, setLegalJournalQuery] = useState("");
    const [isLegalJournalOpen, setIsLegalJournalOpen] = useState(false);
    const [handbook, setHandbook] = useState(handbookSectionLanguage);

    const [pendingUpdates, setPendingUpdates] = useState([
    { 
      id: 1, 
      title: "New State Law on Student Social Media Interaction", 
      date: "2025-09-04", 
      type: "Immediate Action Required", 
      affectedSection: "6. Code of Conduct", 
      rationale: "This new state law requires a more explicit policy than what is currently stated...",
      // ADD THIS NEW PROPERTY WITH THE FULL TEXT
      sourceText: `
**House Bill 1412 - Student and Employee Digital Conduct**

**Section 1: Definitions**
(a) "Electronic Communication" means any transfer of signs, signals, writing, images, sounds, data, or intelligence of any nature transmitted in whole or in part by a wire, radio, electromagnetic, photoelectronic or photooptical system.
(b) "Personal Social Media Account" means an account on a social media platform that is used by a school employee primarily for personal communications unrelated to school business.

**Section 2: Prohibited Conduct**
(a) A school employee is prohibited from establishing or maintaining a personal social media connection with a student currently enrolled in the school district. This includes, but is not limited to, accepting 'friend requests' or engaging in private messaging on platforms not officially sanctioned by the school for educational purposes.
(b) All electronic communication between a school employee and a student must be transparent, professional, and limited to educational matters. Such communication should, whenever possible, take place on school-sanctioned platforms where administrative oversight is possible.
`
    }
]);
    const [archivedUpdates, setArchivedUpdates] = useState([]);
    const [monitoredTrends, setMonitoredTrends] = useState([
    { id: 2, title: "AI Integration in K-12 Curriculum", date: "2025-08-28", type: "Monitor for Future Consideration" },
    { id: 3, title: "Rise in Four-Day School Weeks", date: "2025-08-25", type: "Monitor for Future Consideration" },
    ]);

    const [reviewingUpdate, setReviewingUpdate] = useState(null);
    const [industryQuestions, setIndustryQuestions] = useState([
    { id: 1, category: 'Human Resources', question: 'Has anyone hired an international teacher with U.S. work authorization?', answer: 'Solution: Schools often use H-1B visas for specialty occupations. It requires demonstrating the role needs a specific degree. Consult an immigration attorney to navigate the sponsorship process, including LCA filing and USCIS petitions.' },
    { id: 2, category: 'Human Resources', question: 'Do you allow flexible or remote summer work for employees? Any sample policies?', answer: 'Solution: Yes, many schools offer this. A good policy defines eligibility (e.g., role, performance), expectations for availability and communication, and technology/security requirements. Specify if it\'s fully remote or hybrid.' },
    { id: 5, category: 'Human Resources', question: 'What’s your spending threshold for requiring Board/Finance Committee approval?', answer: 'Solution: This varies by budget size. A common model is: Head of School has discretion up to $X (e.g., $25,000), Finance Committee approval required up to $Y (e.g., $100,000), and full Board approval for anything above.' },
    { id: 10, category: 'Human Resources', question: 'Can anyone share their maternity/paternity leave policies?', answer: 'Solution: A typical independent school policy offers 6-8 weeks of paid leave (often through short-term disability) and allows for the use of accrued sick/personal time. FMLA provides up to 12 weeks of unpaid, job-protected leave.' },
    { id: 13, category: 'Student, Parent & Faculty Handbook Policy Questions', question: 'How should we handle consequences for a student caught stealing multiple valuable items, including apology expectations?', answer: 'Solution: A multi-faceted approach is best: suspension, restitution for stolen items, and a restorative justice component, such as a mediated apology to the victims to ensure it\'s sincere and educational.' },
    { id: 16, category: 'Student, Parent & Faculty Handbook Policy Questions', question: 'How should we approach a report that a student sent explicit images to an adult (prior to a school trip)?', answer: 'Solution: Immediate action is critical. The student should be removed from the trip pending an investigation. The school must follow its child protection policy, which includes reporting the incident to the appropriate authorities (e.g., child protective services).' },
    { id: 23, category: 'Student, Parent & Faculty Handbook Policy Questions', question: 'Do you allow faculty to babysit or tutor current students outside of school? What policy language do you use?', answer: 'Solution: Many schools prohibit or strongly discourage this to avoid dual-role conflicts of interest. A policy should clearly state the school\'s position and require disclosure and approval from a division head if exceptions are considered.' },
    { id: 27, category: 'Governance and Board Topics', question: 'Who signs the annual tuition increase letter: Head, Board Chair, Business Officer, or someone else?', answer: 'Solution: The Board Chair should sign the letter, as setting tuition is a primary fiduciary responsibility of the Board. The Head of School may be a co-signer to show administrative support for the decision.' },
    ]);
    const handleOpenLegalJournal = useCallback((caseName) => {
        setLegalJournalQuery(caseName);
        setIsLegalJournalOpen(true);
    }, []);

    const handleSectionLinkClick = useCallback((sectionNumber) => {
        const sectionData = findSectionByNumber(sectionNumber);
        if (sectionData) {
            setModalSection(sectionData);
        } else {
            console.warn(`Could not find handbook section for number: ${sectionNumber}`);
        }
    }, []);

    const handleCloseLegalJournal = () => {
        setIsLegalJournalOpen(false);
        setLegalJournalQuery("");
    };

    // --- NEW HANDLERS for the Policy Watchtower workflow ---
    const handleApproveUpdate = (update) => {
        const sectionKey = Object.keys(handbook).find(key => key.startsWith(update.affectedSection.split(' ')[0]));
        if (sectionKey) {
            setHandbook(prevHandbook => ({
                ...prevHandbook,
                [sectionKey]: prevHandbook[sectionKey] + update.suggestedLanguage
            }));
        }
        setPendingUpdates(prev => prev.filter(item => item.id !== update.id));
        setArchivedUpdates(prev => [{...update, status: 'Approved'}, ...prev]);
        setReviewingUpdate(null); // Go back to dashboard
    };

    const handleArchiveUpdate = (update) => {
        setPendingUpdates(prev => prev.filter(item => item.id !== update.id));
        setArchivedUpdates(prev => [{...update, status: 'Archived'}, ...prev]);
        setReviewingUpdate(null);
    };

    const handleDismissUpdate = (update) => {
        setPendingUpdates(prev => prev.filter(item => item.id !== update.id));
        setReviewingUpdate(null);
    };
    const SCHOOL_LOGO = "https://i.ytimg.com/vi/wNI9LjpwVDU/maxresdefault.jpg";

    const handbookSections = (onSectionLinkClick) => [
        { section: "1. Introduction", vulnerabilities: [{ text: "The 'at-will' statement is present but could be more prominent to ensure it's not missed.", source: "Legal Best Practice", date: "2025-08-20" }] },
        { section: "2. Equal Employment Opportunity Policies and Procedures", vulnerabilities: [{ text: "Missing an explicit, anonymous reporting channel for harassment complaints, which is an emerging best practice.", source: "Industry Trend", date: "2025-06-22" }] },
        { section: "3. The Employment Relationship", vulnerabilities: [{ text: <span>The Background Check policy (<SectionLink number="3.2" onLinkClick={onSectionLinkClick} />) should specify that findings will be considered in accordance with the Fair Credit Reporting Act (FCRA).</span>, source: "Handbook Audit", date: "2025-08-20" }]},
        { section: "4. Compensation Policies", vulnerabilities: [] },
        { section: "5. Employee Benefit Programs", vulnerabilities: [] },
        { section: "6. Code of Conduct", vulnerabilities: [{ text: <span>The Student-Employee Relationship policy (<SectionLink number="6.3" onLinkClick={onSectionLinkClick} />) needs explicit rules regarding social media interaction (friending, following, direct messaging).</span>, source: "Handbook Audit", date: "2025-07-02" }] },
    ];

    const fullHandbookText = Object.values(handbookSectionLanguage).join("\n\n");

    const handleLegalQaSubmit = async () => {
        const questionText = legalQuestion;
        if (!questionText || !GEMINI_API_KEY) {
             alert("Please provide a question and ensure your API key is set.");
            return;
        }

        setSubmittedLegalQuestion(questionText);
        setIsAnalyzingLegal(true);
        setLegalAnswer(null);
        setLegalQuestion("");
        
   const prompt = `Analyze the legal question for a school administrator.
   CRITICAL INSTRUCTIONS:
   1.  Your entire response must be a single, valid JSON object.
   2.  **Global Formatting Rule:** Throughout the ENTIRE response, whenever you cite a legal statute (e.g., Title IX) or court case (e.g., *Davis v. Monroe*), you MUST format it for linking. Wrap statutes in double asterisks (**Statute Name**) and court cases in single asterisks (*Case Name*).
   3.  For the 'references' object: You MUST provide one **primary, highly-relevant court case** from a K-12 or analogous higher-education context. Populate the 'citation' field with the formatted case name and the 'relevance' field with a concise explanation. If no case can be found, state that in the 'citation' field.
   4.  For the 'guidance' field: Provide a thorough analysis. In your explanation, identify and cite **all relevant statutes** using the required formatting.

   Question: "${questionText}"`;
       
        const legalResponseSchema = {
            type: "OBJECT",
            properties: {
                "guidance": { "type": "STRING" },
                "references": {
               type: "OBJECT",
               properties: {
                   "citation": { "type": "STRING" },
                   "relevance": { "type": "STRING" }
                },
               required: ["citation", "relevance"]
                },
                "risk": {
                    type: "OBJECT",
                    properties: {
                        "level": { "type": "STRING" },
                        "analysis": { "type": "STRING" },
                        "recommendation": { "type": "ARRAY", "items": { "type": "STRING" } }
                    },
                    required: ["level", "analysis", "recommendation"]
                }
            },
            required: ["guidance", "references", "risk"]
        };

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: legalResponseSchema
                }
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); }

            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                const parsedAnswer = JSON.parse(jsonText);
                setLegalAnswer(parsedAnswer);
            } else { throw new Error("Invalid response structure from API"); }
        } catch (error) {
            console.error("Error generating legal AI response:", error);
            setLegalAnswer({
                guidance: `Sorry, I encountered an error. ${error.message}`,
                references: "N/A",
                risk: { level: "Unknown", analysis: "Could not analyze risk.", recommendation: ["Please rephrase your question or contact legal counsel directly."] }
            });
        } finally {
            setIsAnalyzingLegal(false);
        }
    };

    const handleLegalQaClose = () => {
        setSubmittedLegalQuestion(null);
        setLegalAnswer(null);
    };
       
const CALENDAR = ({ initialView, setAttendingEvent, events = [] }) => {
    // State to manage the modal
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // State to manage the view ('list' or 'month'), correctly initialized
    const [view, setView] = useState(initialView || 'list'); 
    
    // State to manage the month being displayed
    const [currentDate, setCurrentDate] = useState(new Date());

    // Placeholder Icons to prevent errors
    const ChevronLeft = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>;
    const ChevronRight = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>;

    const changeMonth = (amount) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderMonthGrid = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="border border-gray-700 bg-gray-800"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const today = new Date();
            const isToday = dayDate.toDateString() === today.toDateString();
            
            // Safety check for events array
            const dayEvents = Array.isArray(events) ? events.filter(event => {
                if (!event || !event.date) return false;
                const eventDate = new Date(event.date + 'T12:00:00Z');
                if (isNaN(eventDate.getTime())) return false;
                return eventDate.toDateString() === dayDate.toDateString();
            }) : [];

            days.push(
                <div key={i} className={`border border-gray-700 p-2 flex flex-col ${isToday ? 'bg-blue-900 bg-opacity-40' : ''}`}>
                    <div className={`font-bold ${isToday ? 'text-white' : 'text-gray-300'}`}>{i}</div>
                    <div className="mt-1 space-y-1 flex-grow overflow-y-auto">
                        {dayEvents.map((event, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setSelectedEvent(event)}
                                className="block w-full text-left bg-emerald-800 hover:bg-emerald-700 text-white text-xs rounded px-2 py-1 whitespace-normal transition-colors"
                            >
                                {event.title}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };


    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-4">Calendar of Events</h1>
            <div className="flex justify-center mb-6">
                <div className="flex items-center bg-gray-700 rounded-lg p-1">
                    <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>List View</button>
                    <button onClick={() => setView('month')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Month View</button>
                </div>
            </div>

            <div className="bg-[#4B5C64] p-4 sm:p-6 rounded-2xl shadow-2xl">
                {view === 'list' ? (
                    <>
                        <div className="hidden md:grid grid-cols-12 gap-6 px-4 pb-3 border-b-2 border-gray-500 font-bold text-sm text-white">
                            <div className="col-span-2">DATE</div>
                            <div className="col-span-2">EVENT TYPE</div>
                            <div className="col-span-2">CATEGORY</div>
                            <div className="col-span-4">NAME</div>
                            <div className="col-span-2 text-center">LOCATION</div>
                        </div>
                        <div className="space-y-4 mt-4">
                            {Array.isArray(events) && events.map((event, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-3 p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors border-l-4 border-[#faecc4]">
                                    <div className="md:hidden font-bold text-gray-400 text-xs uppercase">DATE</div>
                                    <div className="col-span-12 md:col-span-2 font-semibold text-white flex items-center">{event.date ? new Date(event.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'No Date'}</div>
                                    <div className="md:hidden font-bold text-gray-400 text-xs uppercase mt-2 md:mt-0">EVENT TYPE</div>
                                    <div className="col-span-12 md:col-span-2 text-white flex items-center">{event.eventType}</div>
                                    <div className="md:hidden font-bold text-gray-400 text-xs uppercase mt-2 md:mt-0">CATEGORY</div>
                                    <div className="col-span-12 md:col-span-2 text-white flex items-center">{event.category}</div>
                                    <div className="md:hidden font-bold text-gray-400 text-xs uppercase mt-2 md:mt-0">NAME</div>
                                    <div className="col-span-12 md:col-span-4"><h3 className="font-bold text-[#faecc4]">{event.title}</h3><p className="mt-1 text-gray-200 text-sm">{event.description}</p></div>
                                    <div className="col-span-12 md:col-span-2 flex md:flex-col items-start md:items-center justify-between md:justify-center gap-2">
                                        <div><div className="md:hidden font-bold text-gray-400 text-xs uppercase">LOCATION</div><div className="text-white text-left md:text-center">{event.location}</div></div>
                                        <button onClick={() => setAttendingEvent(event, view)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-colors">Attend</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4 px-2">
                            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-600 text-white"><ChevronLeft /></button>
                            <h2 className="text-2xl font-bold text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-600 text-white"><ChevronRight /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center font-bold text-gray-300">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2 border-b border-gray-700">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 auto-rows-fr min-h-[500px]">
                            {renderMonthGrid()}
                        </div>
                    </div>
                )}
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-gray-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative border-l-4 border-[#faecc4]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <div className="space-y-4">
                            <div>
                                <div className="font-bold text-gray-400 text-xs uppercase">DATE</div>
                                <div className="font-semibold text-white">{new Date(selectedEvent.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="font-bold text-gray-400 text-xs uppercase">EVENT TYPE</div>
                                    <div className="text-white">{selectedEvent.eventType}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-400 text-xs uppercase">CATEGORY</div>
                                    <div className="text-white">{selectedEvent.category}</div>
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-400 text-xs uppercase">NAME</div>
                                <h3 className="font-bold text-2xl text-[#faecc4]">{selectedEvent.title}</h3>
                            </div>
                            <div>
                                <div className="font-bold text-gray-400 text-xs uppercase">DESCRIPTION</div>
                                <p className="mt-1 text-gray-200 text-sm">{selectedEvent.description}</p>
                            </div>
                            <div>
                                <div className="font-bold text-gray-400 text-xs uppercase">LOCATION</div>
                                <div className="text-white">{selectedEvent.location}</div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end items-center gap-4">
                            <button onClick={() => setSelectedEvent(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors">Close</button>
                            <button onClick={() => { setAttendingEvent(selectedEvent, view); setSelectedEvent(null); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors">Attend</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
    
    // --- SIDEBAR DATA ---
    const SIDEBAR_LINKS = [
        { key: "dashboard", label: "IQ Dashboard", icon: <Shield className="w-5 h-5" /> },
        { key: "risk", label: "IQ Risk Assessment Center", icon: <AlertCircle className="w-5 h-5" /> },
        { key: "handbook", label: "IQ Handbook Center", icon: <BookOpen className="w-5 h-5" /> },
        { key: "calendar", label: "Calendar", icon: <Calendar className="w-5 h-5" /> },
        { key: "hosqa", label: "IQ School Leaders Q&A", icon: <MessageCircle className="w-5 h-5" /> },
        { key: "legal", label: "IQ Legal Guidance", icon: <Gavel className="w-5 h-5" /> }
    ];

    // --- MAIN PAGE RENDERING LOGIC ---
    const renderPage = () => {
        if (reviewingUpdate) {
            const sectionKey = Object.keys(handbook).find(key => key.startsWith(reviewingUpdate.affectedSection.split(' ')[0]));
            const sectionText = handbook[sectionKey];

            return <ReviewUpdate
                onViewAlertDetail={setViewedAlert}
                update={reviewingUpdate}
                handbookSectionText={sectionText}
                onApprove={handleApproveUpdate}
                onArchive={handleArchiveUpdate}
                onDismiss={handleDismissUpdate}
                onClose={() => setReviewingUpdate(null)}
            />;
        }     

        switch (page) {
            case 'dashboard':
                return <Dashboard />;

            case 'risk':
                return <RiskAssessmentCenter 
                    handbookText={fullHandbookText} 
                    apiKey={GEMINI_API_KEY} 
                    handbookSectionLanguage={handbook} 
                    onSectionLinkClick={handleSectionLinkClick} 
                    onLegalLinkClick={handleOpenLegalJournal} 
                />;

           case 'handbook':
              return <Handbook
                   onViewAlertDetail={setViewedAlert}
                   handbookContent={handbook}
                   pendingUpdates={pendingUpdates}
                   archivedUpdates={archivedUpdates}
                   monitoredTrends={monitoredTrends}
                   onViewUpdate={setReviewingUpdate}
                   apiKey={GEMINI_API_KEY}
                   HandbookVulnerabilitiesCardComponent={(props) => <HandbookVulnerabilitiesCard {...props} sections={handbookSections} onSectionLinkClick={handleSectionLinkClick} />}
                   // ADD THESE TWO PROPS TO PROVIDE DATA TO THE RESTORED SECTIONS
                   handbookSections={handbookSections}
                   onSectionLinkClick={handleSectionLinkClick}
                />;

            case 'calendar':
                return <CALENDAR />;

            case 'hosqa':      
                return <HOSQA
                    industryQuestions={industryQuestions}
                    setIndustryQuestions={setIndustryQuestions}
                    onSectionLinkClick={handleSectionLinkClick}
                    onLegalLinkClick={handleOpenLegalJournal}
                    submittedQuestion={submittedQuestion}
                    setSubmittedQuestion={setSubmittedQuestion}
                    isAnalyzing={isAnalyzing}
                    setIsAnalyzing={setIsAnalyzing}
                    currentAnswer={currentAnswer}
                    setCurrentAnswer={setCurrentAnswer}
                    hosQaQuestion={hosQaQuestion}
                    setHosQaQuestion={setHosQaQuestion}
                />;

            case 'legal':
                return <LEGAL
                    legalQuestion={legalQuestion}
                    setLegalQuestion={setLegalQuestion}
                    submittedLegalQuestion={submittedLegalQuestion}
                    handleLegalQaClose={handleLegalQaClose}
                    handleLegalQaSubmit={handleLegalQaSubmit}
                    isAnalyzingLegal={isAnalyzingLegal}
                    legalAnswer={legalAnswer}
                    handleSectionLinkClick={handleSectionLinkClick}
                    handleOpenLegalJournal={handleOpenLegalJournal}
                />;

            default:
                return <Dashboard />;
        }
    }
    
    // --- MAIN APP LAYOUT ---
    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#fff" }}>
          <header className="shadow flex items-center justify-between px-4 sm:px-8 py-4" style={{ background: "#7c2d2d" }}>
            <div className="flex items-center gap-4">
                <img
                    src={SCHOOL_LOGO}
                    alt="School Logo"
                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
            </div>
            <div className="hidden md:block text-right">
                <div
                    className="flex items-center justify-end"
                    style={{
                        color: "#fff",
                        fontSize: "2.5rem",
                        lineHeight: 1.1,
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    <span className="font-normal">
                        Navigation IQ
                        <sup style={{ fontSize: '0.3em', position: 'relative', top: '-1.5em', marginLeft: '2px' }}>TM</sup>
                    </span>
                </div>
                <div
                    className="font-semibold"
                    style={{
                        color: "#faecc4",
                        fontSize: "0.9rem",
                        marginTop: "4px",
                        lineHeight: 1.4
                    }}
                >
                    The Smart Navigation System for School Policy, Risk Management,
                    <br />
                    Incident Guidance, and Regulatory Insights
                </div>
            </div>
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-white">
                    <Menu size={32} />
                </button>
            </div>
        </header>

            <div className="flex flex-1 min-h-0" style={{ background: "#7c2d2d" }}>
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                )}
                <aside className={`fixed md:relative top-0 left-0 h-full z-30 pt-2 px-4 flex flex-col gap-2 min-w-[250px] shadow-md transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{ background: "#7c2d2d" }}>
                    <div className="md:hidden flex justify-end mb-2">
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                        <X size={28} />
                    </button>
                    </div>
                    {SIDEBAR_LINKS.map(link => (
                        <button
                            key={link.key}
                            className="flex items-center gap-3 px-5 py-2 w-full justify-start text-base font-semibold rounded-lg shadow border-2 border-white transition-all"
                            style={{
                                background: page === link.key ? "#7c2d2d" : "#fff",
                                color: page === link.key ? "#fff" : "#111",
                                borderColor: "#fff"
                            }}
                            onClick={() => {
                                setPage(link.key);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            {React.cloneElement(link.icon, { color: page === link.key ? "#fff" : "#7c2d2d" })}
                            {link.label}
                        </button>
                    ))}
                </aside>

                <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full" style={{ background: "#f3f4f6" }}>
                    {renderPage()}
                </main>
            </div>

            {showSuggestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <TrendingUp className="text-emerald-600" size={24} /> Suggested Update
                        </h3>
                        <div className="mb-6 text-slate-700 font-medium whitespace-pre-line">{suggestedUpdate}</div>
                        <div className="flex justify-end gap-2">
                            <button className="rounded-lg px-5 py-2 border border-gray-300" onClick={() => setShowSuggestionModal(false)}>Cancel</button>
                            <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 rounded-lg py-2" onClick={() => { setShowSuggestionModal(false); console.log(`Suggestion for "${suggestionSectionRef.current}" recorded.`); }}>
                                Add Suggestion to Handbook
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <HandbookSectionModal section={modalSection} onClose={() => setModalSection(null)} />
            {isLegalJournalOpen && (
                <LegalReferenceJournal
                    query={legalJournalQuery}
                    onClose={handleCloseLegalJournal}
                    apiKey={GEMINI_API_KEY}
                />
            )}
            {viewedAlert && <AlertDetailModal alert={viewedAlert} onClose={() => setViewedAlert(null)} />}
            {attendingEvent && (
                <AttendanceModal event={attendingEvent} onClose={() => setAttendingEvent(null)} />
            )}
        </div>
    );
}
