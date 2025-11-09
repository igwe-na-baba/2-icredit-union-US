import React, { useState } from 'react';
import { CharitableCause, Account, Donation } from '../types';
import { SpinnerIcon, CheckCircleIcon, XIcon, ShieldCheckIcon } from './Icons';
import { USER_PIN } from '../constants';

interface DonationModalProps {
    cause: CharitableCause;
    accounts: Account[];
    onClose: () => void;
    onDonate: (donation: Donation) => boolean;
}

const presetAmounts = [25, 50, 100, 250];

export const DonationModal: React.FC<DonationModalProps> = ({ cause, accounts, onClose, onDonate }) => {
    const [step, setStep] = useState(0); // 0: Amount, 1: Confirm, 2: Success
    const [amount, setAmount] = useState('50');
    const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
    const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDonate = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN.');
            return;
        }
        setIsProcessing(true);
        const donation: Donation = {
            id: `don_${Date.now()}`,
            causeId: cause.id,
            amount: Number(amount),
            frequency,
            date: new Date()
        };

        setTimeout(() => {
            const success = onDonate(donation);
            setIsProcessing(false);
            if (success) {
                setStep(2);
            } else {
                setError('Donation failed. Please check your account balance.');
            }
        }, 1500);
    };

    const renderContent = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <p className="text-sm text-slate-600 mb-4">Choose how much you'd like to contribute. Every dollar makes a difference.</p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {presetAmounts.map(p => (
                                <button key={p} onClick={() => setAmount(String(p))} className={`p-3 font-bold rounded-lg ${String(p) === amount ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                    ${p}
                                </button>
                            ))}
                        </div>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset mb-4" placeholder="Custom Amount" />
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <button onClick={() => setFrequency('one-time')} className={`p-3 rounded-lg ${frequency === 'one-time' ? 'shadow-digital-inset' : 'shadow-digital'}`}>One-Time</button>
                            <button onClick={() => setFrequency('monthly')} className={`p-3 rounded-lg ${frequency === 'monthly' ? 'shadow-digital-inset' : 'shadow-digital'}`}>Monthly</button>
                        </div>
                        <button onClick={() => setStep(1)} disabled={!amount || Number(amount) <= 0} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:opacity-50">
                            Continue
                        </button>
                    </>
                );
            case 1:
                return (
                    <>
                        <p className="text-sm text-slate-600 mb-4">Review your donation and confirm with your PIN.</p>
                        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 text-sm mb-4">
                            <div className="flex justify-between"><span>Amount:</span> <span className="font-bold font-mono">${Number(amount).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Frequency:</span> <span className="font-semibold capitalize">{frequency}</span></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From Account</label>
                            <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname} ({acc.balance.toLocaleString('en-US', {style: 'currency', currency: 'USD'})})</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mt-2">Enter PIN to Authorize</label>
                            <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset text-center tracking-[1em]" placeholder="----" />
                        </div>
                        {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                        <div className="mt-6 flex gap-3">
                             <button onClick={() => setStep(0)} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                             <button onClick={handleDonate} disabled={isProcessing || pin.length !== 4} className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold shadow-md disabled:opacity-50">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5 mx-auto" /> : `Confirm ${frequency === 'monthly' ? 'Monthly' : ''} Donation`}
                            </button>
                        </div>
                    </>
                );
            case 2:
                 return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Thank You!</h3>
                        <p className="text-slate-600 mt-2">Your generous donation makes a real difference. A confirmation has been sent to your email.</p>
                        <button onClick={onClose} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
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
                    <h2 className="text-2xl font-bold text-slate-800">Donate to {cause.title}</h2>
                </div>
                {renderContent()}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
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