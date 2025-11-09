import React from 'react';
import { View } from '../types';
import {
    ICreditUnionLogo,
    XSocialIcon,
    LinkedInIcon,
    InstagramIcon,
    AppleIcon,
    GooglePlayIcon,
    FdicIcon,
    EqualHousingLenderIcon,
} from './Icons';

interface FooterProps {
    setActiveView: (view: View) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
    
    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Global Presence Display */}
                <div className="relative rounded-2xl p-8 bg-slate-800/50 shadow-digital mb-12 h-96 flex flex-col justify-center items-center text-center overflow-hidden">
                    {/* Video Background */}
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
                        src="https://static.videezy.com/system/resources/previews/000/046/234/original/starfield.mp4"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
                    {/* Text Content */}
                    <div className="relative z-20">
                        <h2 className="text-3xl font-bold text-slate-100 mb-2 glow-text animate-text-focus-in">A Dynamic Global Network</h2>
                        <p className="text-slate-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                            Our infrastructure spans the globe, leveraging real-time data and a distributed network to power your finances securely and instantly, wherever you are.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                         <div className="flex items-center space-x-2 mb-4">
                            <ICreditUnionLogo />
                            <p className="font-bold text-slate-200">iCredit Union®</p>
                        </div>
                        <p className="text-sm">
                            The new standard in global finance, built on trust, transparency, and technology.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><button onClick={() => setActiveView('dashboard')} className="hover:text-primary-400 transition-colors">Dashboard</button></li>
                            <li><button onClick={() => setActiveView('send')} className="hover:text-primary-400 transition-colors">Send Money</button></li>
                            <li><button onClick={() => setActiveView('cards')} className="hover:text-primary-400 transition-colors">Cards</button></li>
                            <li><button onClick={() => setActiveView('history')} className="hover:text-primary-400 transition-colors">History</button></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><button onClick={() => setActiveView('about')} className="hover:text-primary-400 transition-colors">About Us</button></li>
                            <li><button onClick={() => setActiveView('security')} className="hover:text-primary-400 transition-colors">Security Center</button></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Press</a></li>
                            <li><button onClick={() => setActiveView('contact')} className="hover:text-primary-400 transition-colors">Contact Support</button></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li><button onClick={() => setActiveView('terms')} className="hover:text-primary-400 transition-colors">Terms of Service</button></li>
                            <li><button onClick={() => setActiveView('privacy')} className="hover:text-primary-400 transition-colors">Privacy Center</button></li>
                            <li><button onClick={() => setActiveView('cookies')} className="hover:text-primary-400 transition-colors">Cookie Policy</button></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Download Our App</h3>
                        <ul className="mt-4 space-y-3">
                            <li>
                                <a href="#" className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors text-white w-full">
                                    <AppleIcon className="w-8 h-8"/>
                                    <span className="text-left">
                                        <span className="block text-xs text-slate-400">Download on the</span>
                                        <span className="text-sm font-semibold">App Store</span>
                                    </span>
                                </a>
                            </li>
                             <li>
                                <a href="#" className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors text-white w-full">
                                    <GooglePlayIcon className="w-8 h-8"/>
                                    <span className="text-left">
                                        <span className="block text-xs text-slate-400">GET IT ON</span>
                                        <span className="text-sm font-semibold">Google Play</span>
                                    </span>
                                </a>
                            </li>
                        </ul>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase mt-6">Follow Us</h3>
                        <div className="flex space-x-6 text-slate-400 mt-4">
                            <a href="#" aria-label="X" className="hover:text-white transition-colors"><XSocialIcon className="w-5 h-5"/></a>
                            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><LinkedInIcon className="w-5 h-5"/></a>
                            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><InstagramIcon className="w-5 h-5"/></a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-700 pt-8 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} iCredit Union®. All rights reserved.</p>
                </div>

                <div className="mt-8 border-t border-slate-700 pt-8 text-xs text-slate-500 text-center space-y-3">
                    <p>iCredit Union® is a fictional entity created for demonstration purposes only. This web application and its contents are not real financial services.</p>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <FdicIcon className="w-8 h-8"/>
                            <span className="font-semibold">Member FDIC</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <EqualHousingLenderIcon className="w-8 h-8"/>
                            <span className="font-semibold">Equal Housing Lender</span>
                        </div>
                    </div>
                    <p>NMLS ID: 9999999 (Simulated)</p>
                </div>
            </div>
        </footer>
    );
};