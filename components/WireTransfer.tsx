import React, { useState, useMemo, useEffect } from 'react';
import { Account, Recipient, Transaction, AccountType } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, BankIcon, ArrowRightIcon, ArrowDownTrayIcon, ArrowPathIcon } from './Icons';
import { RecipientSelector } from './RecipientSelector';
import { DownloadableReceipt } from './DownloadableReceipt';
import { ReCaptcha } from './ReCaptcha';

interface WireTransferProps {
    accounts: Account[];
    recipients: Recipient[];
    onBackToDashboard: () => void;
    createWireTransaction: (wireData: any) => Transaction | null;
}

const stepsConfig = ['Amount', 'Details', 'Review', 'Receipt'];

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center justify-center mb-8">
        {stepsConfig.map((label, index) => (
            <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${index < currentStep ? 'bg-green-500 text-white' : index === currentStep ? 'bg-primary text-white scale-110' : 'bg-slate-300 text-slate-500'}`}>
                        {index < currentStep ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${index <= currentStep ? 'text-slate-700' : 'text-slate-400'}`}>{label}</p>
                </div>
                {index < stepsConfig.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                )}
            </React.Fragment>
        ))}
    </div>
);

export const WireTransfer: React.FC<WireTransferProps> = ({ accounts, recipients, onBackToDashboard, createWireTransaction }) => {
    const internalAccounts = accounts.filter(a => a.type !== AccountType.EXTERNAL_LINKED);

    const [step, setStep] = useState(0);
    const [sourceAccountId, setSourceAccountId] = useState(internalAccounts[0]?.id || '');
    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [amount, setAmount] = useState('');
    const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'same_day_domestic'>('standard');
    const [purpose, setPurpose] = useState('');
    const [memo, setMemo] = useState('');
    const [intermediaryBank, setIntermediaryBank] = useState('');
    const [intermediaryBankName, setIntermediaryBankName] = useState('');
    const [intermediaryBankAddress, setIntermediaryBankAddress] = useState('');
    const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);
    const [rateLockCountdown, setRateLockCountdown] = useState(60);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);


    const transferType = recipient?.country.code === 'US' ? 'Domestic' : 'International';
    const numericAmount = parseFloat(amount) || 0;
    
    const fee = useMemo(() => {
        if (transferType === 'Domestic') {
            return deliverySpeed === 'same_day_domestic' ? 35 : 25;
        }
        return 45; // International
    }, [transferType, deliverySpeed]);

    const exchangeRate = useMemo(() => recipient ? (EXCHANGE_RATES[recipient.country.currency] || 1) : 1, [recipient]);
    const receiveAmount = numericAmount * exchangeRate;
    const totalDebit = numericAmount + fee;
    const sourceAccount = accounts.find(a => a.id === sourceAccountId);

    const canProceedToStep1 = sourceAccount && recipient && numericAmount > 0 && sourceAccount.balance >= totalDebit;
    const canProceedToStep2 = purpose.trim().length > 0;
    
    useEffect(() => {
        let timer: number;
        if (step === 2 && rateLockCountdown > 0) {
            timer = window.setInterval(() => {
                setRateLockCountdown(prev => prev - 1);
            }, 1000);
        } else if (rateLockCountdown <= 0 && step === 2) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [step, rateLockCountdown]);
    
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = () => {
        setIsSubmitting(true);
        const wireData = {
            sourceAccountId,
            recipient,
            sendAmount: numericAmount,
            fee,
            totalDebit,
            exchangeRate,
            receiveAmount,
            deliverySpeed,
            purpose,
            memo,
            intermediaryBank,
            intermediaryBankName,
            intermediaryBankAddress,
        };
        
        setTimeout(() => { // Simulate API call
            const result = createWireTransaction(wireData);
            if (result) {
                setCompletedTransaction(result);
                setStep(3); // Go to receipt
            } else {
                // Handle error from parent
                alert("Wire transfer failed. Please check your balance and try again.");
            }
            setIsSubmitting(false);
        }, 2000);
    };
    
    const handleReset = () => {
        setStep(0);
        setRecipient(null);
        setAmount('');
        setPurpose('');
        setMemo('');
        setIntermediaryBank('');
        setIntermediaryBankName('');
        setIntermediaryBankAddress('');
        setIsRecaptchaVerified(false);
        setCompletedTransaction(null);
        setRateLockCountdown(60);
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Amount & Recipient
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From Account</label>
                            <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset">
                                {internalAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">To Recipient</label>
                            <button type="button" onClick={() => setIsRecipientSelectorOpen(true)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset flex justify-between items-center text-left">
                                {recipient ? <span>{recipient.fullName} - {recipient.bankName}</span> : <span className="text-slate-500">Select a recipient</span>}
                                <span>▼</span>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Amount to Send</label>
                             <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="0.00 USD" />
                        </div>
                        {sourceAccount && totalDebit > sourceAccount.balance && <p className="text-red-500 text-sm">Amount exceeds available balance.</p>}
                        <div className="pt-4 flex justify-end">
                            <button onClick={handleNext} disabled={!canProceedToStep1} className="px-6 py-2 text-white bg-primary rounded-lg shadow-md disabled:opacity-50">Next</button>
                        </div>
                    </div>
                );
            case 1: // Details
                return (
                    <div className="space-y-4">
                        <p className="font-bold">{transferType} Wire Details</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Purpose of Wire</label>
                            <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="e.g., Payment for Services, Family Support" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Memo / Description (Optional)</label>
                            <input type="text" value={memo} onChange={e => setMemo(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="e.g., Invoice #123" />
                        </div>
                        {transferType === 'International' && (
                            <div className="p-4 bg-slate-300/50 rounded-lg mt-4 space-y-4">
                                <p className="text-sm font-bold text-slate-700">Intermediary Bank Details (Optional)</p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Intermediary Bank SWIFT/BIC</label>
                                    <input type="text" value={intermediaryBank} onChange={e => setIntermediaryBank(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="e.g., CITIUS33" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Intermediary Bank Name</label>
                                    <input type="text" value={intermediaryBankName} onChange={e => setIntermediaryBankName(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="e.g., Citibank N.A." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Intermediary Bank Address</label>
                                    <input type="text" value={intermediaryBankAddress} onChange={e => setIntermediaryBankAddress(e.target.value)} className="mt-1 w-full p-3 rounded-md shadow-digital-inset" placeholder="e.g., 111 Wall Street, New York" />
                                </div>
                            </div>
                        )}
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Speed</label>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                 <button onClick={() => setDeliverySpeed('standard')} className={`p-3 rounded-lg text-left ${deliverySpeed === 'standard' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                     <p className="font-bold">Standard</p>
                                     <p className="text-xs text-slate-500">{transferType === 'Domestic' ? 'Next business day' : '1-3 business days'}</p>
                                 </button>
                                  {transferType === 'Domestic' && <button onClick={() => setDeliverySpeed('same_day_domestic')} className={`p-3 rounded-lg text-left ${deliverySpeed === 'same_day_domestic' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                     <p className="font-bold">Same-Day</p>
                                     <p className="text-xs text-slate-500">Within a few hours</p>
                                 </button>}
                             </div>
                        </div>
                        <div className="pt-4 flex justify-between">
                            <button onClick={handleBack} className="px-6 py-2 bg-slate-200 rounded-lg shadow-digital">Back</button>
                            <button onClick={handleNext} disabled={!canProceedToStep2} className="px-6 py-2 text-white bg-primary rounded-lg shadow-md disabled:opacity-50">Next</button>
                        </div>
                    </div>
                );
            case 2: // Review
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset divide-y divide-slate-300">
                             <div className="py-2"><span className="text-slate-500">From:</span> <span className="font-semibold float-right">{sourceAccount?.nickname}</span></div>
                             <div className="py-2"><span className="text-slate-500">To:</span> <span className="font-semibold float-right">{recipient?.fullName}</span></div>
                             <div className="py-2"><span className="text-slate-500">Send Amount:</span> <span className="font-mono font-semibold float-right">{numericAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                             <div className="py-2"><span className="text-slate-500">Fee:</span> <span className="font-mono font-semibold float-right">{fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                             {transferType === 'International' && <div className="py-2"><span className="text-slate-500">Exchange Rate:</span> <span className="font-mono float-right">1 USD ≈ {exchangeRate.toFixed(4)} {recipient?.country.currency}</span></div>}
                             <div className="py-2 font-bold"><span className="text-slate-600">Total Debit:</span> <span className="font-mono float-right text-lg">{totalDebit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                             {transferType === 'International' && <div className="py-2 font-bold"><span className="text-slate-600">Recipient Gets:</span> <span className="font-mono float-right text-lg text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: recipient?.country.currency })}</span></div>}
                        </div>
                        <ReCaptcha onVerified={setIsRecaptchaVerified} />
                        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-start space-x-2">
                             <ExclamationTriangleIcon className="w-5 h-5 mt-0.5"/>
                             <p className="text-xs">Wire transfers are final and cannot be reversed. Please verify all details before submitting.</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-slate-500">Rate locked for:</p>
                            <p className={`text-xl font-bold font-mono ${rateLockCountdown < 10 ? 'text-red-500' : 'text-slate-800'}`}>{rateLockCountdown}s</p>
                        </div>
                        <div className="pt-4 flex justify-between">
                            <button onClick={handleBack} className="px-6 py-2 bg-slate-200 rounded-lg shadow-digital">Back</button>
                            <button onClick={handleSubmit} disabled={isSubmitting || rateLockCountdown <= 0 || !isRecaptchaVerified} className="px-6 py-2 text-white bg-green-600 rounded-lg shadow-md disabled:opacity-50 flex items-center">
                               {isSubmitting ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                               {isSubmitting ? 'Submitting...' : 'Submit Wire'}
                            </button>
                        </div>
                    </div>
                );
            case 3: // Receipt
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto"/>
                        <h2 className="text-2xl font-bold mt-4">Wire Submitted Successfully</h2>
                        <p className="text-slate-500">Reference: <span className="font-mono">{completedTransaction?.wireReferenceNumber}</span></p>
                        <div className="mt-6 p-4 bg-slate-200 rounded-lg shadow-digital-inset text-left">
                           <p>A confirmation has been sent to your email. The funds have been debited from your account and are being processed.</p>
                        </div>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button onClick={handleReset} className="px-6 py-2 bg-slate-200 rounded-lg shadow-digital">Send Another Wire</button>
                            <button onClick={onBackToDashboard} className="px-6 py-2 text-white bg-primary rounded-lg shadow-md">Back to Dashboard</button>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="relative rounded-2xl overflow-hidden p-8 bg-slate-900">
             <div 
                className="absolute inset-0 z-0 bg-cover bg-center animate-ken-burns"
                style={{
                    backgroundImage: "url('https://i.imgur.com/gplT3gQ.jpeg')"
                }}
            ></div>
            <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm z-0"></div>

            <div className="relative z-10">
                {isRecipientSelectorOpen && <RecipientSelector recipients={recipients.filter(r => r.recipientType !== 'service')} onSelect={(r) => { setRecipient(r); setIsRecipientSelectorOpen(false); }} onClose={() => setIsRecipientSelectorOpen(false)} />}
                <div className="bg-slate-200/90 backdrop-blur-md rounded-2xl shadow-digital p-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Advanced Wire Transfer</h2>
                    {step < 3 && <StepIndicator currentStep={step} />}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};
