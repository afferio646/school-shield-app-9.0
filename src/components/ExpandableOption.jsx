import React from 'react';

// This new version will explicitly pass the link-handling props to its children.
export default function ExpandableOption({ title, children, isOpen, onToggle, onSectionLinkClick, onLegalLinkClick }) {
    return (
        <div className="border rounded-md p-4 shadow-sm my-2 bg-gray-800 border-gray-600">
            <div className="font-semibold cursor-pointer hover:underline text-yellow-300" onClick={onToggle}>
                {isOpen ? '▼' : '▶'} {title}
            </div>
            {isOpen && (
                <div className="mt-2 space-y-2">
                    {/* This is the new, more robust way to handle children */}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            // We are forcing the props onto the child component here
                            return React.cloneElement(child, { onSectionLinkClick, onLegalLinkClick });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
}
