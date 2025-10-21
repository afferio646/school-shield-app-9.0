import React from 'react';
import { Briefcase, HeartHandshake, Gavel, DollarSign, Search, Globe, UserCheck } from 'lucide-react';

const modules = [
    { id: 'leave', title: "Leave & Accommodation Navigator", summary: "Navigate FMLA, ADA, state leave, and workers' comp.", IconComponent: HeartHandshake },
    { id: 'discipline', title: "Disciplinary Action Advisor", summary: "Guidance on warnings, improvement plans, and terminations.", IconComponent: Gavel },
    { id: 'wage_hour', title: "Wage & Hour Compliance", summary: "Check employee classifications and overtime rules.", IconComponent: DollarSign },
    { id: 'investigation', title: "Workplace Investigation Manager", summary: "Step-by-step protocols for harassment and discrimination claims.", IconComponent: Search },
    { id: 'multi_state', title: "Multi-State Compliance Checker", summary: "Analyze policy gaps for remote employees in different states.", IconComponent: Globe },
    { id: 'hiring', title: "Hiring & Background Checks", summary: "Ensure compliance with FCRA and 'Ban-the-Box' laws.", IconComponent: UserCheck },
    { id: 'benefits', title: "Benefits Compliance Assistant", summary: "Guidance on COBRA, ACA, and HIPAA qualifying events.", IconComponent: Briefcase }
];

export default function IQHRCenter({ onModuleSelect }) {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">IQ HR Solutions Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((module) => (
                    <button 
                        key={module.id}
                        onClick={() => onModuleSelect(module.id)}
                        className="text-left rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group" 
                        style={{ background: "#4B5C64" }}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <module.IconComponent className="h-10 w-10" style={{ color: "#faecc4" }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-tight group-hover:underline" style={{ color: "#faecc4" }}>{module.title}</h3>
                                    <p className="text-gray-300 text-sm mt-2">
                                        {module.summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
