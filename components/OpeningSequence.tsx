import React, { useState, useEffect } from 'react';
// FIX: Renamed ApexBankLogo to ICreditUnionLogo to fix the import error.
import { ICreditUnionLogo, CheckCircleIcon } from './Icons';

const loadingMessages = [
    "Establishing Secure Connection...",
    "Encrypting Data Packets...",
    "Verifying Device Integrity...",
    "Authenticating User Credentials...",
    "Loading User Profile & Settings...",
    "Syncing Account Data...",
    "Finalizing Secure Session..."
];

interface OpeningSequenceProps {
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'loading' | 'success'>('loading');
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const totalDuration = 4000; // Shorter, more professional duration
        // Cycle through messages
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => {
                if (prev >= loadingMessages.length - 1) {
                    clearInterval(messageInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, totalDuration / loadingMessages.length);

        // Main timer to trigger the success animation
        const successTimer = setTimeout(() => {
            clearInterval(messageInterval);
            setPhase('success');
        }, totalDuration);

        return () => {
            clearInterval(messageInterval);
            clearTimeout(successTimer);
        };
    }, []);

    useEffect(() => {
        if (phase === 'success') {
            const completeTimer = setTimeout(() => {
                onComplete();
            }, 1000); // Wait 1s on success screen
            return () => clearTimeout(completeTimer);
        }
    }, [phase, onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-800/90 flex flex-col items-center justify-center text-white z-[100] overflow-hidden">
            <div className="w-80 h-80" style={{ perspective: '1200px' }}>
                <div 
                    className="relative w-full h-full transition-transform duration-[800ms] ease-in-out" 
                    style={{ transformStyle: 'preserve-3d', transform: phase === 'success' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* Front side: Loading animation */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center text-center p-4" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                <circle className="ring" cx="50" cy="50" r="48" stroke="rgb(var(--color-primary-700))" strokeWidth="1" fill="none" style={{ animationDuration: '10s' }} />
                                <circle className="ring" cx="50" cy="50" r="40" stroke="rgb(var(--color-primary-600))" strokeWidth="1" fill="none" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
                                <circle className="ring" cx="50" cy="50" r="32" stroke="rgb(var(--color-primary-500))" strokeWidth="1" fill="none" style={{ animationDuration: '5s' }} />
                            </svg>
                            <div className="animate-pulse">
                                <ICreditUnionLogo />
                            </div>
                        </div>
                        <p className="mt-8 text-slate-300 text-sm font-medium transition-opacity duration-500" key={messageIndex}>
                            {loadingMessages[messageIndex]}
                        </p>
                    </div>

                    {/* Back side: Success message */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center bg-slate-800/90 rounded-3xl shadow-digital" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="animate-pop-in">
                            <CheckCircleIcon className="w-24 h-24 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>Login Successful</h2>
                    </div>
                </div>
            </div>
            <style>{`
                .ring { transform-origin: center; animation: rotate 20s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};