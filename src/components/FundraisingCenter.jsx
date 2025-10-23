import React from 'react';
import { TrendingUp, Target, Scale } from 'lucide-react';

export default function FundraisingCenter() {
    const cards = [
        {
            title: "Capital Campaign Navigator",
            description: "Step-by-step guidance for planning, launching, and managing successful capital campaigns from start to finish.",
            icon: <Target size={36} className="text-white" />
        },
        {
            title: "Fundraising Policy & Compliance",
            description: "Ensure your fundraising activities and donor relations are compliant with state and federal regulations.",
            icon: <Scale size={36} className="text-white" />
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-bold text-center mb-8">IQ Fundraising & Development Center</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.title} className="bg-[#4B5C64] p-6 rounded-2xl shadow-lg text-white text-left">
                        <div className="mb-4">{card.icon}</div>
                        <h3 className="text-xl font-bold text-[#faecc4] mb-2">{card.title}</h3>
                        <p className="text-gray-300">{card.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
