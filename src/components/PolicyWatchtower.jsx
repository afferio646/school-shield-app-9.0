import React, { useState } from 'react';
import { Archive, Bell, Eye } from "lucide-react";

function SectionHeader({ icon, title }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>
    );
}

export default function PolicyWatchtower({ pendingUpdates, archivedUpdates, monitoredTrends, onViewUpdate, onViewAlertDetail }) {
    const [activeTab, setActiveTab] = useState(null);

    const handleTabClick = (tabName) => {
        setActiveTab(prevTab => (prevTab === tabName ? null : tabName));
    };

    const TabButton = ({ tabName, label, count }) => (
        <button
            onClick={() => handleTabClick(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                activeTab === tabName
                    ? 'bg-gray-700 text-white' // Active tab is already white, which is good.
                    // CHANGED: Inactive tab font is now brighter.
                    : 'bg-gray-600 text-gray-200 hover:text-white' 
            }`}
        >
            {label} {count > 0 && 
                // CHANGED: The badge is now always red.
                <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {count}
                </span>
            }
        </button>
    );

    const renderUpdateItem = (item) => (
        <div key={item.id} className="p-3 bg-gray-700 rounded-lg flex items-center justify-between shadow-md gap-4">
            <div 
                className="flex-grow cursor-pointer group"
                onClick={() => onViewAlertDetail(item)}
            >
                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                    Date Identified: {item.date}
                    {item.type === 'Immediate Action Required' && <span className="ml-2 font-bold text-red-400">URGENT</span>}
                </p>
            </div>
            {activeTab === 'pending' && (
                <button
                    onClick={() => onViewUpdate(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                    <Eye size={16} />
                    Review
                </button>
            )}
        </div>
    );

    const renderContent = () => {
        let items;
        switch (activeTab) {
            case 'pending':
                items = pendingUpdates;
                break;
            case 'archived':
                items = archivedUpdates;
                break;
            case 'monitored':
                items = monitoredTrends;
                break;
            default:
                items = [];
        }
        return items.length > 0
            ? items.map(item => renderUpdateItem(item))
            : <p className="text-center text-gray-400 py-8">No items to display.</p>;
    };

    return (
        <div className="shadow-2xl border-0 rounded-2xl" style={{ background: "#4B5C64", color: "#fff" }}>
            <div className="p-6">
                <SectionHeader icon={<Bell className="text-[#faecc4]" size={28} />} title="IQ Handbook Watchtower" />
                <p className="mb-6 text-gray-300">Proactive identification of current industry legislation and trends that are analyzed for their impact on your handbook. Review alerts that require your attention.</p>
                
                <div className="flex border-b border-gray-600">
                    <TabButton tabName="pending" label="Actionable Alerts" count={pendingUpdates.length} />
                    <TabButton tabName="archived" label="Archived" count={archivedUpdates.length} />
                    <TabButton tabName="monitored" label="Monitored Alerts" count={monitoredTrends.length} />
                </div>
                
                {activeTab && (
                    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2">
                        {renderContent()}
                    </div>
                )}
            </div>
        </div>
    );
}
