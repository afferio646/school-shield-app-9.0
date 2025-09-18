import React from 'react';

export default function ExpandableOption({ title, children, isOpen, onToggle }) {
    return (
        <div className="border rounded-md p-4 shadow-sm my-2 bg-gray-800 border-gray-600">
            <div className="font-semibold cursor-pointer hover:underline text-yellow-300" onClick={onToggle}>
                {isOpen ? '▼' : '▶'} {title}
            </div>
            {isOpen && <div className="mt-2 space-y-2">{children}</div>}
        </div>
    );
}
