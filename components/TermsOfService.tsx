import React from 'react';
import { ICreditUnionLogo } from './Icons';

const PolicySection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">{title}</h2>
        <div className="space-y-4 text-slate-700 text-base leading-relaxed prose">
            {children}
        </div>
    </section>
);

export const TermsOfService: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-slate-50 text-slate-800 p-8 md:p-12 rounded-lg border-4 border-slate-200 ring-1 ring-slate-300">
            <header className="text-center border-b-4 border-double border-slate-300 pb-6 mb-8">
                <h1 className="text-4xl font-serif font-extrabold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <PolicySection title="I. Acceptance of Terms">
                <p>By accessing or using the iCredit Union® digital banking platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use this Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            </PolicySection>

            <PolicySection title="II. Account Security">
                <p>You are responsible for safeguarding the password and PIN that you use to access the Service and for any activities or actions under your password. We encourage you to use a "strong" password (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.</p>
                <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
            </PolicySection>
            
            <PolicySection title="III. Prohibited Activities">
                <p>You may not use the Service for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the Service. You are solely responsible for your conduct and any data, text, information, screen names, graphics, photos, profiles, audio and video clips, links ("Content") that you submit, post, and display on the Service.</p>
            </PolicySection>

            <PolicySection title="IV. Limitation of Liability">
                <p>In no event shall iCredit Union®, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
            </PolicySection>

            <PolicySection title="V. Governing Law">
                <p>These Terms shall be governed and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.</p>
            </PolicySection>
            
            <footer className="mt-12 pt-6 border-t-4 border-double border-slate-300 text-center">
                <div className="flex items-center justify-center space-x-4">
                    <div className="w-16 h-16 opacity-20">
                        <ICreditUnionLogo />
                    </div>
                    <div>
                        <p className="font-serif font-bold text-slate-800">Official Seal of iCredit Union®</p>
                        <p className="text-xs text-slate-500">This document constitutes a binding agreement.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};