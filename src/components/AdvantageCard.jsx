import React from 'react';

export default function AdvantageCard() {
    return (
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#4B5C64" }}>
            <div className="p-6">
                <h3 className="text-2xl font-bold" style={{ color: "#faecc4" }}>The Navigation IQ Advantage: Precision vs. Probability</h3>
                
                <p className="text-gray-200 mt-4 mb-6">
                    The answer lies in our "Fact-First" architecture. While a generic AI provides a "probable" answer from the public internet, Navigation IQ uses secure APIs to gather data only from trusted sources: your specific handbook, vetted legal libraries, and current state and federal databases. Our system then synthesizes this factual data to generate a precise and defensible strategy. This is the difference between a guess and guidance.
                </p>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-700/50 text-xs uppercase" style={{ color: "#faecc4" }}>
                            <tr>
                                <th scope="col" className="px-4 py-3">Capability</th>
                                <th scope="col" className="px-4 py-3">Generic GPT (e.g., ChatGPT)</th>
                                <th scope="col" className="px-4 py-3">Navigation IQ System</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-500">
                                <th scope="row" className="px-4 py-4 font-bold text-white">Knowledge Source</th>
                                <td className="px-4 py-4">❌ The public internet (forums, blogs, outdated laws)</td>
                                <td className="px-4 py-4">✅ <strong className="font-bold text-white">Your Handbook</strong> + Vetted Legal/State/Federal Databases</td>
                            </tr>
                            <tr className="border-b border-gray-500">
                                <th scope="row" className="px-4 py-4 font-bold text-white">Context Awareness</th>
                                <td className="px-4 py-4">❌ None. Cannot reference your specific policies.</td>
                                <td className="px-4 py-4">✅ High. Every analysis is cross-referenced with your documents.</td>
                            </tr>
                            <tr className="border-b border-gray-500">
                                <th scope="row" className="px-4 py-4 font-bold text-white">Reliability</th>
                                <td className="px-4 py-4">⚠️ Variable. Can "hallucinate" fake legal cases.</td>
                                <td className="px-4 py-4">✅ High. All guidance is grounded in a fact-first database.</td>
                            </tr>
                            <tr className="border-b border-gray-500">
                                <th scope="row" className="px-4 py-4 font-bold text-white">Audit Trail</th>
                                <td className="px-4 py-4">❌ No. A chat history is not a defensible business record.</td>
                                <td className="px-4 py-4">✅ Yes. Creates a permanent, auditable record of every decision.</td>
                            </tr>
                            <tr>
                                <th scope="row" className="px-4 py-4 font-bold text-white">Final Output</th>
                                <td className="px-4 py-4">📝 A block of text.</td>
                                <td className="px-4 py-4">⚙️ A step-by-step, actionable <strong className="font-bold text-white">process</strong>.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
