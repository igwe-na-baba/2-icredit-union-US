import React, { useState } from 'react';
import { SpinnerIcon, ExclamationTriangleIcon } from './Icons';
import { CLEARANCE_CODE } from '../constants';

interface AuthorizationWarningModalProps {
    transactionId: string;
    onAuthorize: (transactionId: string) => void;
    onClose: () => void;
    onContactSupport: () => void;
}

export const AuthorizationWarningModal: React.FC<AuthorizationWarningModalProps> = ({ transactionId, onAuthorize, onClose, onContactSupport }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = () => {
        setError('');
        if (code.toUpperCase() !== CLEARANCE_CODE) {
            setError('Invalid clearance code. Please review your documentation or contact support.');
            return;
        }
        setIsProcessing(true);
        // The parent component will handle the next steps.
        onAuthorize(transactionId);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 border border-yellow-500/50 animate-fade-in-up">
                <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4 ring-8 ring-yellow-500/10">
                        <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100">Action Required: IMF Clearance</h3>
                    <div className="text-slate-400 mt-2 space-y-3 text-sm">
                        <p>Your transfer has been temporarily held for mandatory compliance screening in accordance with international financial regulations (IMF/AML Protocols).</p>
                        <p>To release the funds, please provide the <strong className="text-slate-200">International Transfer Clearance Code (ITCC)</strong> provided by the receiving institution.</p>
                    </div>
                </div>
                <div className="px-6 space-y-4">
                    <div>
                        <label htmlFor="clearance-code" className="block text-sm font-medium text-slate-300">International Transfer Clearance Code (ITCC)</label>
                        <input 
                            id="clearance-code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="mt-1 w-full bg-slate-900/50 text-white p-3 rounded-md shadow-inner text-center tracking-widest font-mono focus:ring-2 focus:ring-primary"
                            placeholder="Enter code here"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
                    </div>
                </div>
                <div className="p-6 flex flex-col sm:flex-row gap-4">
                    <button onClick={handleSubmit} disabled={isProcessing} className="w-full py-3 text-white bg-primary rounded-lg font-semibold flex items-center justify-center">
                        {isProcessing ? <SpinnerIcon className="w-5 h-5 mr-2"/> : 'Authorize & Release Funds'}
                    </button>
                </div>
                <div className="px-6 pb-6 text-center">
                    <button onClick={onContactSupport} className="text-sm text-slate-400 hover:text-primary-300 underline">
                        Contact support for assistance
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};