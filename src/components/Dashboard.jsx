import React from 'react';
import { Shield } from "lucide-react";

// We are including the SectionHeader helper component directly in this file
// to keep it self-contained and avoid import errors.
function SectionHeader({ icon, title, children }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
            {children}
        </div>
    );
}

// This is the main Dashboard component.
export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="shadow-2xl border-0" style={{ background: "#4B5C64" }}>
                <div className="p-6" style={{ color: "#fff" }}>
                    <SectionHeader icon={<Shield className="text-blue-400" size={28} />} title="Welcome" />
                    <div className="text-lg text-white mb-3 space-y-4">
                        <p><strong>Navigation IQ<sup style={{ fontSize: '0.6em' }}>TM</sup> is the new standard in dynamic policy, guidance, and risk management for school leaders.</strong></p>
                        <p>Our System has been designed with input from school leaders as an intelligence based Micro Utility providing proactive clarity and solutions for risk management, policy guidance, industry insights, and counsel, empowering school leaders with efficient certainty to stay ahead of day-to-day challenges.</p>
                        <p>Resolve faculty/student/parent issues and complaints, navigate legal complexities, identify handbook vulnerabilities, and protect your school community, while saving time, reducing costs, and strengthening your leadership impact.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
