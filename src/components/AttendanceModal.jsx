import React, { useState } from 'react';
import { X, Calendar, DollarSign, Clock } from 'lucide-react';

export default function AttendanceModal({ event, onClose }) {
    const [email, setEmail] = useState('');

    if (!event) return null; // Don't render if no event is selected

    const handleConfirm = () => {
        // In a real application, you would send this email to a backend
        // For now, we'll just log it and close the modal.
        console.log(`Confirmed attendance for ${event.title}. Email: ${email}`);
        alert(`Thank you for confirming! An email with details for "${event.title}" will be sent to ${email}.`);
        onClose();
    };

    const eventDate = new Date(event.date + 'T12:00:00Z').toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const eventTime = "9:00 AM PST"; // Placeholder for event time

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#4B5C64]">Confirm Your Attendance</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <h3 className="text-xl font-semibold text-blue-700">{event.title}</h3>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} className="text-blue-500" />
                        <span>{eventDate}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                        <Clock size={18} className="text-blue-500" />
                        <span>{eventTime}</span> {/* Displaying the placeholder time */}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600 text-lg font-bold">
                        <DollarSign size={20} className="text-green-600" />
                        <span className="text-green-700">$80.00</span> {/* Hardcoded cost */}
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                        Your Email Address:
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="border-t border-gray-200 pt-4 flex flex-col items-end">
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors w-full sm:w-auto"
                        disabled={!email} // Disable if email is empty
                    >
                        Confirm
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center sm:text-right w-full">
                        Clicking the confirm button will generate an email that will be sent to you with event details.
                    </p>
                </div>
            </div>
        </div>
    );
}
