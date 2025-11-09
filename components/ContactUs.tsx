import React, { useState } from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, CheckCircleIcon, SpinnerIcon } from './Icons';

export const ContactUs: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">Contact Us</h1>
                <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                    We're here to help. Reach out to us through any of the channels below, or use the contact form to send us a message directly.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="bg-slate-200 p-6 rounded-2xl shadow-digital space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Send us a Message</h2>
                    {status === 'success' ? (
                        <div className="text-center p-8">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">Message Sent!</h3>
                            <p className="text-slate-600 mt-2">Thank you for reaching out. A member of our team will get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input type="text" name="name" onChange={handleChange} value={formState.name} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" name="email" onChange={handleChange} value={formState.email} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Message</label>
                                <textarea name="message" rows={5} onChange={handleChange} value={formState.message} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" required></textarea>
                            </div>
                            <button type="submit" disabled={status === 'submitting'} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:opacity-50 flex items-center justify-center">
                                {status === 'submitting' && <SpinnerIcon className="w-5 h-5 mr-2" />}
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-slate-200 p-6 rounded-2xl shadow-digital space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Other Ways to Reach Us</h2>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <PhoneIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Phone Support</h3>
                                <p className="text-sm text-slate-600">General Inquiries: <a href="tel:+18005550100" className="text-primary hover:underline">+1 (800) 555-0100</a></p>
                                <p className="text-sm text-slate-600">Fraud & Security: <a href="tel:+18005550101" className="text-primary hover:underline">+1 (800) 555-0101</a></p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <EnvelopeIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Email</h3>
                                <p className="text-sm text-slate-600">General: <a href="mailto:support@icreditunion.com" className="text-primary hover:underline">support@icreditunion.com</a></p>
                                <p className="text-sm text-slate-600">Careers: <a href="mailto:careers@icreditunion.com" className="text-primary hover:underline">careers@icreditunion.com</a></p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <MapPinIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-slate-800">Mailing Address</h3>
                                <address className="text-sm text-slate-600 not-italic">
                                    iCredit Union® Headquarters<br/>
                                    123 Finance Street<br/>
                                    New York, NY 10001, USA
                                </address>
                            </div>
                        </div>
                    </div>
                     <div className="pt-6 border-t border-slate-300">
                         <p className="text-sm text-slate-600">For instant help, you can also use our <strong className="text-slate-700">AI Banking Assistant</strong> available 24/7 at the bottom right of your screen.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};