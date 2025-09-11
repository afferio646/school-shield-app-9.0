import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import ExpandableOption from './ExpandableOption.jsx';

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
    );
}

export default function HandbookComparisonCard({ apiKey }) {
    const [selectedTopic, setSelectedTopic] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedLanguage, setSuggestedLanguage] = useState(null);
    const [openOptions, setOpenOptions] = useState({
        ts: true,
        h1: true,
        h2: true
    });

    const handleOptionToggle = (key) => {
        setOpenOptions(prev => ({...prev, [key]: !prev[key]}));
    };

    // RESTORED: This is the full, original, untruncated data object.
    const comparisonTopics = {
        socialMedia: {
            name: "Employee Social Media & Digital Conduct",
            ts: `8.3 Technology Acceptable Use Policy\nOverview: This Technology Acceptable Use Policy for TS is enacted by the school to provide the parents, students, and staff of the TS community with a statement of purpose and explanation of the use of technology within the TS learning community...\nInappropriate Access to Material: Employees will not use the network to access material (hate literature) that is profane or obscene, that advocates illegal acts, or that advocates violence or discrimination towards other people (hate literature). A special exception may be made for hate literature if the purpose of their access is to conduct research for their classroom. Social networking websites (Myspace, Facebook, etc.) are also off limits unless it is for valid school purposes.`,
            h1: `Social Media Policy\nThis policy is designed to guide employees in the appropriate use of social media in relation to their professional responsibilities, ensuring that both their personal and professional online presence reflect the values and standards expected within CWS.\nProfessional Conduct Online: Teachers and school employees are role models, and their online presence should align with the professional expectations of the education sector. When engaging in online activities, employees should:\n- Maintain professional boundaries: Do not engage in online conversations or interactions with students on personal social media accounts, including never being friends/following/etc. current students.\n- Respect privacy: Avoid posting or sharing personal information about students, colleagues, or the school community without permission.\n- Act in a respectful manner: All online communications should be courteous, respectful, and demonstrate professionalism. Avoid engaging in arguments or inappropriate discussions online.\n- Avoid conflicts of interest: Do not use social media to promote personal interests or commercial activities that could create conflicts of interest with your role as a CWS employee.`,
            h2: `Social Networking\n- Employees may not "friend," "follow," or otherwise link to students currently enrolled at the School via the employees' personal social networking outlets. This is an instance of mixing one's professional and personal digital footprints, mentioned above. Note that a school-run social networking site created for a school-sponsored activity or group that is intended for educational purposes only is the only acceptable instance in which employees may link with students via a social networking outlet.\n- Employees are strongly discouraged from "friending," "following," or otherwise linking to parents of currently enrolled students via the employees' personal social networking outlets, even if the employee and parent have a social relationship outside of school.`,
            analysis: {
                gap: "TS's policy is outdated and lacks the specific, explicit prohibition against direct, private social media connections with students that is now considered best practice and is present in both H1 and H2's handbooks.",
                risk: "This ambiguity creates a significant liability risk regarding professional boundaries. Without a clear prohibition, faculty-student interactions on platforms like Instagram or TikTok could lead to inappropriate communication, parental complaints, or legal challenges where the school's policy provides insufficient defense.",
                benchmark: "The language in H1 and H2, which explicitly forbids 'friending' or 'following' current students, aligns with recommendations from the National Association of Independent Schools (NAIS) for maintaining clear and defensible professional boundaries in the digital age."
            },
            recommendations: [
                "**Immediate Action:** Issue a formal memo to all faculty and staff clarifying that direct, private social media connections with current students on personal accounts are prohibited, pending a formal handbook update.",
                "**Short-Term Goal (30-60 days):** Draft and approve new language for the Technology Acceptable Use Policy that explicitly incorporates the prohibitions found in the benchmark schools.",
                "**Long-Term Strategy:** Include a mandatory 20-minute training module on digital professionalism and boundaries in the faculty in-service day at the start of the next academic year to ensure universal understanding and compliance."
            ],
            suggestedLanguage: `To ensure professional boundaries are maintained and to protect both students and employees, all faculty and staff are prohibited from engaging in private online interactions with currently enrolled students on personal social media platforms. This prohibition includes, but is not limited to, "friending," "following," accepting connection requests from, or initiating direct messages with students on any social media platform (e.g., Facebook, Instagram, TikTok, X). All school-related digital communication must be conducted through official, school-sanctioned channels, such as the school's learning management system or official email addresses.`
        },
        harassment: {
            name: "Harassment Policy & Reporting Procedures",
            ts: `2.4 Non-Discrimination and Harassment\nTS is committed to providing a school environment that is free from all forms of discrimination and harassment... If you experience or witness sexual or other unlawful harassment at TS, report it immediately to your supervisor. If your supervisor is unavailable or if you are uncomfortable contacting that person, you should immediately report this harassment to the Head of School, or any school administrator. All allegations of sexual harassment and other unlawful harassment will be quickly and discreetly investigated.`,
            h1: `Employee Policy against Harassment\nAny employee who believes they have experienced or witnessed harassment is encouraged to report the incident promptly. Employees are encouraged to speak with their immediate supervisor or another administrator they feel comfortable with. If the supervisor or administrator is the subject of the complaint, employees may report the issue to an alternative person, such as the Faculty or Administrative Director. Any supervisor or administrator receiving a complaint must report the complaint to both the Administrative and Faculty Director within 24 hours.`,
            h2: `Policy against Harassment\nIf an employee believes that he/she has been subject to harassment or discrimination, the following procedure should be followed... If the employee does not feel comfortable confronting the person, he/she should promptly contact someone at school to whom he/she or the offending party reports, either directly or indirectly. This may include the Head of School, Division Heads, the Business Manager, or Department Chairs. The response will include an investigation by the Business Manager into the concern and the facts of the situation, and appropriate formal action if harassment or discrimination is found to have occurred.`,
            analysis: {
                gap: "TS's policy provides direct reporting channels but lacks an anonymous or confidential reporting mechanism. This is a critical gap, as employees may fear retaliation or discomfort when reporting issues involving a direct supervisor.",
                risk: "Without an anonymous channel, the school may not learn of serious issues until they escalate significantly. This increases the risk of a hostile work environment claim, as an employee could argue they had no safe way to report the harassment, making the school liable for inaction.",
                benchmark: "Many institutions now provide multiple reporting avenues, including a confidential third-party hotline or a designated compliance officer outside the direct chain of command, to ensure all employees feel safe making a report."
            },
            recommendations: [
                "**Immediate Action:** Designate a secondary administrator (e.g., Director of Finance/HR) as an official alternative for reporting harassment if the primary channel is the source of the conflict.",
                "**Short-Term Goal (30-60 days):** Research and implement a low-cost anonymous reporting system. This could be a simple, dedicated email address monitored by a trusted administrator or a more formal third-party service.",
                "**Long-Term Strategy:** Update the handbook to explicitly include the new anonymous reporting channel and communicate the updated policy to all employees, emphasizing the school's commitment to a safe and respectful workplace."
            ],
            suggestedLanguage: `In addition to reporting concerns to a supervisor or the Head of School, employees who wish to make a confidential or anonymous report of harassment, discrimination, or retaliation may do so through the school's confidential reporting hotline at [Phone Number] or via the online reporting portal at [Web Address]. These channels are administered by a third party to ensure anonymity. All reports will be investigated promptly and discreetly. The school prohibits retaliation against any individual who makes a good faith report under this policy.`
        }
    };

    const handleAnalyze = () => {
        if (!selectedTopic) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setSuggestedLanguage(null);
        setTimeout(() => {
            const topicData = comparisonTopics[selectedTopic];
            setAnalysisResult(topicData);
            setIsAnalyzing(false);
        }, 1000);
    };
    
    const handleSuggestChange = () => {
        if (!analysisResult) return;
        setIsSuggesting(true);
        setTimeout(() => {
            setSuggestedLanguage(analysisResult.suggestedLanguage);
            setIsSuggesting(false);
        }, 1000);
    };

    const handleClose = () => {
        setAnalysisResult(null);
        setSelectedTopic("");
        setSuggestedLanguage(null);
    };

    return (
        <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64" }}>
            <div className="p-6 text-white">
                <SectionHeader icon={<Scale className="text-[#faecc4]" size={26} />} title="IQ Handbook Comparison" />
                
                <div className="space-y-2 text-gray-200">
                    <p>Compare your current handbook to others based on specific queries.</p>
                    <div>
                        <label htmlFor="handbookQuery" className="block font-medium mb-1">Select a Topic to Analyze</label>
                        <select id="handbookQuery" className="w-full p-2 rounded-md text-black" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} disabled={!!analysisResult}>
                            <option value="">-- Select a Topic --</option>
                            {Object.entries(comparisonTopics).map(([key, value]) => (
                                <option key={key} value={key}>{value.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-2">
                        {!analysisResult ? (
                            <button className="bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-800" onClick={handleAnalyze} disabled={isAnalyzing || !selectedTopic}>
                                {isAnalyzing ? "Analyzing..." : "Analyze"}
                            </button>
                        ) : (
                            <button className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-red-700" onClick={handleClose}>
                                Close Analysis
                            </button>
                        )}
                    </div>
                </div>

                {analysisResult && (
                    <div className="mt-6 border-t border-gray-500 pt-4 space-y-4">
                        <ExpandableOption title="Your Current Handbook (TS)" isOpen={openOptions.ts} onToggle={() => handleOptionToggle('ts')}>
                             <p className="text-blue-200 p-3 rounded-md whitespace-pre-line bg-gray-900">{analysisResult.ts}</p>
                        </ExpandableOption>
                        <ExpandableOption title="Handbook Comparison 1 (H1)" isOpen={openOptions.h1} onToggle={() => handleOptionToggle('h1')}>
                            <p className="text-gray-200 bg-gray-700 p-3 rounded-md whitespace-pre-line">{analysisResult.h1}</p>
                        </ExpandableOption>
                        <ExpandableOption title="Handbook Comparison 2 (H2)" isOpen={openOptions.h2} onToggle={() => handleOptionToggle('h2')}>
                            <p className="text-gray-200 bg-gray-700 p-3 rounded-md whitespace-pre-line">{analysisResult.h2}</p>
                        </ExpandableOption>
                        
                        <div className="p-4 rounded-md bg-green-900 bg-opacity-40 border border-green-500">
                             <h4 className="font-bold text-lg text-green-300 mb-2">AI Analysis & Recommendations</h4>
                             <div className="space-y-3 text-white">
                                 <p><strong>Policy Gap:</strong> {analysisResult.analysis?.gap}</p>
                                 <p><strong>Potential Risk:</strong> {analysisResult.analysis?.risk}</p>
                                 <p><strong>Industry Benchmark:</strong> {analysisResult.analysis?.benchmark}</p>
                                 <div className="border-t border-green-700 mt-3 pt-3">
                                     <h5 className="font-semibold text-green-200">Action Plan:</h5>
                                     <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                         {analysisResult.recommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                                     </ul>
                                 </div>
                             </div>
                             {!suggestedLanguage && (
                                 <div className="mt-4">
                                     <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-blue-700" onClick={handleSuggestChange} disabled={isSuggesting}>
                                         {isSuggesting ? "Generating..." : "Generate Suggested Language"}
                                     </button>
                                 </div>
                             )}
                        </div>

                        {suggestedLanguage && (
                            <div className="p-4 rounded-md bg-yellow-900 bg-opacity-40 border-yellow-500">
                                <h4 className="font-bold text-lg text-yellow-300 mb-2">AI-Generated Language</h4>
                                <div className="text-white bg-gray-800 p-3 rounded-md whitespace-pre-line italic">{suggestedLanguage}</div>
                                <div className="mt-4">
                                    <button className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-green-700" onClick={() => alert("This would add the language to the handbook in a live system.")}>
                                        Add to Handbook
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
