import React, { useState, useEffect } from 'react';
import { NfcIcon, SpinnerIcon, CheckCircleIcon } from './Icons';

interface TapToPayModalProps {
    onClose: () => void;
}

type TapStep = 'ready' | 'processing' | 'success';

export const TapToPayModal: React.FC<TapToPayModalProps> = ({ onClose }) => {
    const [step, setStep] = useState<TapStep>('ready');

    useEffect(() => {
        if (step === 'ready') {
            const timer = setTimeout(() => setStep('processing'), 2500);
            return () => clearTimeout(timer);
        }
        if (step === 'processing') {
            const timer = setTimeout(() => setStep('success'), 2000);
            return () => clearTimeout(timer);
        }
        if (step === 'success') {
            const timer = setTimeout(onClose, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, onClose]);

    const renderContent = () => {
        switch (step) {
            case 'ready':
                return (
                    <>
                        <NfcIcon className="w-16 h-16 text-primary" />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">Ready to Pay</h2>
                        <p className="text-slate-500 mt-2">Hold your device near the reader.</p>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-4 border-primary rounded-full animate-ping-slow opacity-50"></div>
                            <div className="w-80 h-80 border-2 border-primary rounded-full animate-ping-slow opacity-30" style={{animationDelay: '0.5s'}}></div>
                        </div>
                    </>
                );
            case 'processing':
                return (
                     <>
                        <SpinnerIcon className="w-16 h-16 text-primary" />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">Processing...</h2>
                        <p className="text-slate-500 mt-2">Authorizing payment.</p>
                    </>
                );
            case 'success':
                 return (
                     <>
                        <CheckCircleIcon className="w-16 h-16 text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800 mt-4">Payment Successful</h2>
                    </>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-sm m-4 p-8 text-center flex flex-col items-center justify-center h-80 animate-fade-in-up">
                {renderContent()}
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                @keyframes ping-slow {
                    0% { transform: scale(0.5); opacity: 0.7; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
            `}</style>
        </div>
    );
};