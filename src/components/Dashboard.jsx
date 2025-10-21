import React from 'react';
import AdvantageCard from './AdvantageCard.jsx'; // Import the new component

// This component is now local to the dashboard
function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold" style={{ color: "#faecc4" }}>{title}</h2>
        </div>
    );
}

export default function Dashboard() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* --- WELCOME CARD --- */}
            <div className="rounded-2xl shadow-2xl p-6" style={{ background: "#4B5C64" }}>
                <SectionHeader title="Welcome" />
                <div className="text-gray-200 space-y-4">
                    <p>
                        <strong>Navigation IQ™</strong> is the new standard in dynamic policy, guidance, and risk management for non-profits & schools.
                    </p>
                    <p>
                        Our System has been designed with input from industry leaders as an intelligence-based Micro Utility, providing proactive clarity and solutions for risk management, policy guidance, industry insights, and counsel. This empowers leaders with efficient certainty to stay ahead of day-to-day challenges.
                    </p>
                    <p>
                        Resolve handbook vulnerabilities and policy issues, employee/faculty/student/parent incidents and complaints, navigate legal complexities, and protect your non-profit business or school community, while saving time, reducing costs, and strengthening your leadership impact.
                    </p>
                </div>
            </div>

            {/* --- NEW ADVANTAGE CARD --- */}
            <AdvantageCard />
        </div>
    );
}
