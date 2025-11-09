import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import { USER_PIN } from '../constants';
import { SpinnerIcon, ShieldCheckIcon, XIcon } from './Icons';

interface FeePaymentModalProps {
    transaction: Transaction;
    accounts: Account[];
    onClose: () => void;
    onConfirm: (sourceAccountId: string, feeAmount: number, transactionId: string) => boolean;
}

export const FeePaymentModal: React.FC<FeePaymentModalProps> = ({ transaction, accounts, onClose, onConfirm }) => {
    const feePercentage = 0.15;
    const feeAmount = useMemo(() => transaction.sendAmount * feePercentage, [transaction.sendAmount]);

    const [sourceAccountId, setSourceAccountId] = useState(accounts.find(a => a.balance >= feeAmount)?.id || accounts[0]?.id || '');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const sourceAccount = accounts.find(a => a.id === sourceAccountId);
    const hasSufficientFunds = sourceAccount ? sourceAccount.balance >= feeAmount : false;

    const handleSubmit = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }
        if (!hasSufficientFunds) {
            setError('Insufficient funds in the selected account to pay the fee.');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            const success = onConfirm(sourceAccountId, feeAmount, transaction.id);
            if (!success) {
                setError('An unexpected error occurred. Please try again.');
                setIsProcessing(false);
            }
            // On success, the parent will close the modal.
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 border border-primary/50 animate-fade-in-up">
                <div className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 ring-8 ring-primary/10">
                        <ShieldCheckIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100">Compliance Fee Payment</h2>
                    <p className="text-slate-400 mt-2 text-sm">Pay the 15% processing fee to release your transfer held for compliance review.</p>
                </div>

                <div className="px-6 space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-lg shadow-inner space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Original Amount:</span> <span className="font-mono text-slate-200">{transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Processing Fee (15%):</span> <span className="font-mono text-slate-200">{feeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300">Pay From</label>
                        <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 p-3 rounded-md">
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</option>)}
                        </select>
                        {!hasSufficientFunds && <p className="text-red-400 text-xs mt-1">Insufficient funds in this account.</p>}
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-300">Enter PIN to Authorize</label>
                        <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="mt-1 w-full bg-slate-700/50 border border-slate-600 p-3 rounded-md text-center tracking-[1em]" placeholder="----" />
                    </div>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </div>
                
                <div className="p-6 mt-2 flex gap-4">
                    <button onClick={onClose} disabled={isProcessing} className="w-full py-3 text-slate-200 bg-white/10 rounded-lg font-semibold">Cancel</button>
                    <button onClick={handleSubmit} disabled={isProcessing || pin.length !== 4 || !hasSufficientFunds} className="w-full py-3 text-white bg-primary rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                        {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : `Pay Fee & Release`}
                    </button>
                </div>
                
            </div>
        </div>
    );
};
