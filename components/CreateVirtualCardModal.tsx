import React, { useState } from 'react';
import { SpinnerIcon, CheckCircleIcon, XIcon, ShieldCheckIcon } from './Icons';

interface CreateVirtualCardModalProps {
    linkedCardId: string;
    onClose: () => void;
    onCreateVirtualCard: (linkedCardId: string, nickname: string, spendingLimit: number | null) => void;
}

type Step = 'form' | 'processing' | 'success';

export const CreateVirtualCardModal: React.FC<CreateVirtualCardModalProps> = ({ linkedCardId, onClose, onCreateVirtualCard }) => {
    const [step, setStep] = useState<Step>('form');
    const [nickname, setNickname] = useState('');
    const [limitType, setLimitType] = useState<'none' | 'monthly'>('none');
    const [spendingLimit, setSpendingLimit] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!nickname.trim()) {
            setError('Please enter a nickname for your card.');
            return;
        }
        const numericLimit = limitType === 'monthly' ? parseInt(spendingLimit, 10) : null;
        if (limitType === 'monthly' && (!numericLimit || numericLimit <= 0)) {
            setError('Please enter a valid monthly limit greater than zero.');
            return;
        }

        setStep('processing');
        setTimeout(() => {
            onCreateVirtualCard(linkedCardId, nickname, numericLimit);
            setStep('success');
        }, 1500);
    };

    const renderContent = () => {
        switch (step) {
            case 'form':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-slate-700">Card Nickname</label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                className="mt-1 w-full p-3 rounded-md shadow-digital-inset"
                                placeholder="e.g., Online Subscriptions"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Spending Limit</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setLimitType('none')} className={`p-3 rounded-lg ${limitType === 'none' ? 'shadow-digital-inset' : 'shadow-digital'}`}>No Limit</button>
                                <button type="button" onClick={() => setLimitType('monthly')} className={`p-3 rounded-lg ${limitType === 'monthly' ? 'shadow-digital-inset' : 'shadow-digital'}`}>Set Monthly Limit</button>
                            </div>
                        </div>
                        {limitType === 'monthly' && (
                            <div className="animate-fade-in-up">
                                <label htmlFor="spendingLimit" className="block text-sm font-medium text-slate-700">Monthly Limit (USD)</label>
                                <input
                                    type="number"
                                    id="spendingLimit"
                                    value={spendingLimit}
                                    onChange={e => setSpendingLimit(e.target.value)}
                                    className="mt-1 w-full p-3 rounded-md shadow-digital-inset"
                                    placeholder="e.g., 100"
                                />
                            </div>
                        )}
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <div className="pt-4 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">Create Card</button>
                        </div>
                    </form>
                );
            case 'processing':
                return (
                    <div className="text-center p-8">
                        <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">Generating your secure virtual card...</h3>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Virtual Card Created!</h3>
                        <p className="text-slate-600 mt-2">Your new card "{nickname}" is now available in your wallet.</p>
                        <button onClick={onClose} className="mt-6 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                            Done
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 relative animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        <ShieldCheckIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Create Virtual Card</h2>
                </div>
                {renderContent()}
                {step === 'form' && (
                     <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
                )}
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
        </div>
    );
};