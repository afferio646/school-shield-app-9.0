import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ContactSupportModal({ onClose }) {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Contact Support</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <p className="text-lg text-gray-700 mb-4">Your message is important to us. We will get back to you within 24 hours.</p>
                        <button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Email</label>
                                <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Describe your question or issue</label>
                                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" required></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="rounded-lg px-5 py-2 border border-gray-300" onClick={onClose}>Cancel</button>
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 rounded-lg py-2">
                                Submit
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
