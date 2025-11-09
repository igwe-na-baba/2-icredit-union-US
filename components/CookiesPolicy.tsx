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

export const CookiesPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-slate-50 text-slate-800 p-8 md:p-12 rounded-lg border-4 border-slate-200 ring-1 ring-slate-300">
             <header className="text-center border-b-4 border-double border-slate-300 pb-6 mb-8">
                <h1 className="text-4xl font-serif font-extrabold text-slate-900 mb-2">Cookie Policy</h1>
                <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <PolicySection title="I. What Are Cookies?">
                <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>
            </PolicySection>

            <PolicySection title="II. How We Use Cookies">
                <p>We use cookies for several purposes, including:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>Essential Cookies:</strong> These are necessary for the operation of our Service. They include, for example, cookies that enable you to log into secure areas of our website.</li>
                    <li><strong>Performance Cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works.</li>
                    <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (for example, your choice of language or region).</li>
                    <li><strong>Targeting Cookies:</strong> These cookies record your visit to our website, the pages you have visited and the links you have followed. We will use this information to make our website and the advertising displayed on it more relevant to your interests.</li>
                </ul>
            </PolicySection>
            
            <PolicySection title="III. Your Choices Regarding Cookies">
                <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. Most browsers allow you to control cookies through their settings preferences.</p>
                <p>Please note that if you choose to refuse cookies you may not be able to use the full functionality of our Service.</p>
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