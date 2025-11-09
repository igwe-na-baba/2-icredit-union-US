import React from 'react';
import { XIcon } from './Icons';

interface ScrollablePolicyModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export const ScrollablePolicyModal: React.FC<ScrollablePolicyModalProps> = ({ title, children, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-800/90 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col m-4 animate-fade-in-up border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-slate-100">{title}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    {children}
                </div>
                <div className="flex-shrink-0 p-4 border-t border-slate-700 text-right sticky bottom-0 bg-slate-800/90 backdrop-blur-sm">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                        Close
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};