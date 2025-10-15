import React from 'react';
import { ShieldCheck } from "lucide-react";

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>
    );
}

export default function Dashboard() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-700 p-6 sm:p-8 rounded-2xl shadow-2xl text-white">
                <SectionHeader icon={<ShieldCheck className="text-blue-300" size={28} />} title="Welcome" />
                <div className="space-y-4 text-gray-200">
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
        </div>
    );
}
