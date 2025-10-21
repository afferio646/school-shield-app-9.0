import React from 'react';
import { Briefcase, HeartHandshake, Gavel, DollarSign, Search, Globe, UserCheck } from 'lucide-react'; // Ensure HeartHandshake is imported

const modules = [
    { id: 'leave', title: "Leave & Accommodation Navigator", summary: "Navigate FMLA, ADA, state leave, and workers' comp. Ensure compliance and streamline processes.", IconComponent: HeartHandshake },
    { id: 'discipline', title: "Disciplinary Action Advisor", summary: "Guidance on warnings, improvement plans, and terminations. Reduce legal risk with proper documentation.", IconComponent: Gavel },
    { id: 'wage_hour', title: "Wage & Hour Compliance", summary: "Check employee classifications and overtime rules. Avoid costly penalties and audits.", IconComponent: DollarSign },
    { id: 'investigation', title: "Workplace Investigation Manager", summary: "Step-by-step protocols for harassment and discrimination claims. Conduct thorough and compliant investigations.", IconComponent: Search },
    { id: 'multi_state', title: "Multi-State Compliance Checker", summary: "Analyze policy gaps for remote employees in different states. Stay compliant across all jurisdictions.", IconComponent: Globe },
    { id: 'hiring', title: "Hiring & Background Checks", summary: "Ensure compliance with FCRA and 'Ban-the-Box' laws. Build fair and compliant hiring processes.", IconComponent: UserCheck },
    { id: 'benefits', title: "Benefits Compliance Assistant", summary: "Guidance on COBRA, ACA, and HIPAA qualifying events. Manage employee benefits with confidence.", IconComponent: Briefcase }
];

export default function IQHRCenter({ onModuleSelect }) {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">IQ HR Solutions Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <button 
                        key={module.id}
                        onClick={() => onModuleSelect(module.id)}
                        className="text-left rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between" 
                        style={{ background: "#4B5C64", minHeight: '180px' }} // Added minHeight for consistent card size
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4 mb-2"> {/* Align items-start for consistent top alignment */}
                                <module.IconComponent className="h-10 w-10 text-gold flex-shrink-0" /> {/* Larger icon, prevent shrinking */}
                                <h3 className="text-xl font-bold text-gold leading-tight">{module.title}</h3> {/* Adjusted line-height */}
                            </div>
                            <p className="text-gray-300 text-sm mt-2">
                                {module.summary}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
