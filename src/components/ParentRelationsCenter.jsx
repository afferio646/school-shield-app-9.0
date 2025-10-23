import React from 'react';
import { Megaphone, MessageSquareWarning, Users, Share2 } from 'lucide-react';

export default function ParentRelationsCenter() {
    const cards = [
        {
            title: "Parent Complaint Navigator",
            description: "Structured workflows for addressing, documenting, and resolving parent concerns in a fair and consistent manner.",
            icon: <MessageSquareWarning size={36} className="text-white" />
        },
        {
            title: "Community Engagement Advisor",
            description: "Tools and strategies for building strong relationships with parent associations, alumni, and the wider community.",
            icon: <Users size={36} className="text-white" />
        },
        {
            title: "Social Media Manager",
            description: "Guidance on managing the school's online presence, responding to comments, and mitigating social media risks.",
            icon: <Share2 size={36} className="text-white" />
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-bold text-center mb-8">IQ Parent & Community Relations Center</h1>
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
