import React, { useState } from 'react';
import { X, LifeBuoy } from 'lucide-react';

export default function ContactSupportModal({ isOpen, onClose }) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        email: '',
        issue: ''
    });

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would send the data to a server here.
        // For this demo, we'll just show the confirmation message.
        setIsSubmitted(true);
    };

    // This resets the form when the modal is closed
    const handleClose = () => {
        setIsSubmitted(false);
        setFormData({ name: '', school: '', email: '', issue: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full text-black relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <LifeBuoy className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-bold">Contact Support</h2>
                </div>

                {isSubmitted ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-700">Thank you for your message!</p>
                        <p className="mt-2 text-gray-600">Your message is important to us. We will be back to you within 24 hours.</p>
                        <button
                            onClick={handleClose}
                            className="mt-6 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">School Name</label>
                            <input type="text" name="school" value={formData.school} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">How can we help?</label>
                            <textarea name="issue" value={formData.issue} onChange={handleInputChange} rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
