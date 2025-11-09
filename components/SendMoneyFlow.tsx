import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus, AccountType, UserProfile } from '../types';
import { STANDARD_FEE, EXPRESS_FEE, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from '../constants';
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, KeypadIcon, FaceIdIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon, XIcon, XCircleIcon, NetworkIcon, GlobeAltIcon, UsersIcon } from './Icons';
import { triggerHaptic } from '../utils/haptics';
import { PaymentReceipt } from './PaymentReceipt';
import { CheckDepositFlow } from './CheckDepositFlow';
import { TransferConfirmationModal } from './TransferConfirmationModal';
import { RecipientSelector } from './RecipientSelector';
import { BankLogo, getBankIcon } from './BankLogo';


interface SendMoneyFlowProps {
  recipients: Recipient[];
  accounts: Account[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Transaction | null;
  transactions: Transaction[];
  securitySettings: SecuritySettings;
  hapticsEnabled: boolean;
  onAuthorizeTransaction: (transactionId: string) => void;
  setActiveView: (view: View) => void;
  onClose: () => void;
  onLinkAccount: () => void;
  onDepositCheck: (details: { amount: number, accountId: string, images: { front: string, back: string } }) => void;
  onSplitTransaction: (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }) => boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  userProfile: UserProfile;
  onContactSupport: () => void;
  onPayFee: (transaction: Transaction) => void;
  exchangeRates: { [key: string]: number };
}

const securityCheckMessages = [
    'Verifying transaction details...',
    'Running fraud analysis...',
    'Performing compliance screening...',
    'Finalizing secure transfer...'
];


// Main Component
export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({ recipients, accounts, createTransaction, transactions, securitySettings, hapticsEnabled, onAuthorizeTransaction, setActiveView, onClose, onLinkAccount, onDepositCheck, onSplitTransaction, initialTab, userProfile, onContactSupport, onPayFee, exchangeRates }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'split' | 'deposit'>(initialTab || 'send');
  const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: SecurityCheck, 4: Complete
  const [isSplitConfirmOpen, setIsSplitConfirmOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);

  // Calculate internal and external accounts before they are used in state initializers.
  const { internalAccounts, externalAccounts } = useMemo(() => {
    const internal = accounts.filter(acc => acc.type !== AccountType.EXTERNAL_LINKED);
    const external = accounts.filter(acc => acc.type === AccountType.EXTERNAL_LINKED);
    return { internalAccounts: internal, externalAccounts: external };
  }, [accounts]);
  
  // Form State (Single Send)
  const [sourceAccountId, setSourceAccountId] = useState<string>(() => (internalAccounts.length > 0 ? internalAccounts[0].id : ''));
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients.length > 0 ? recipients[0] : null);
  const [sendAmount, setSendAmount] = useState('');
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0]);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express'>('Standard');
  const [receiveCurrency, setReceiveCurrency] = useState<string>(selectedRecipient?.country.currency || 'GBP');
  const [rateLockCountdown, setRateLockCountdown] = useState(60);

  // Form State (Split)
  const [splitRecipients, setSplitRecipients] = useState<Recipient[]>([]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitType, setSplitType] = useState<'even' | 'custom'>('even');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const recipientInputRef = useRef<HTMLDivElement>(null);


  // Security State
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authAttempted = useRef(false);

  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  const [securityCheckMessageIndex, setSecurityCheckMessageIndex] = useState(0);
  
  const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

  // Single Send calculations
  const fee = deliverySpeed === 'Express' ? EXPRESS_FEE : STANDARD_FEE;
  const numericSendAmount = parseFloat(sendAmount) || 0;
  const exchangeRate = exchangeRates[receiveCurrency] || 0;
  const receiveAmount = numericSendAmount * exchangeRate;
  const totalCost = numericSendAmount + fee;
  
  const amountError = useMemo(() => {
    if (numericSendAmount < 0) return "Amount cannot be negative.";
    if (numericSendAmount > 0 && !sourceAccount) return "Source account not found.";
    // Bypass balance check for external accounts
    if (sourceAccount && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      if (numericSendAmount > 0 && totalCost > sourceAccount.balance) {
          return `Total cost of ${totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} exceeds your balance.`;
      }
    }
    return null;
  }, [numericSendAmount, totalCost, sourceAccount]);
  
  const isAmountInvalid = amountError !== null || numericSendAmount <= 0;

  const liveTransaction = useMemo(() => {
    if (!createdTransaction) return null;
    return transactions.find(t => t.id === createdTransaction.id) || createdTransaction;
  }, [transactions, createdTransaction]);

  const hapticTrigger = useCallback(() => {
    if(hapticsEnabled) triggerHaptic();
  }, [hapticsEnabled]);

  const handleNextStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev + 1);
  }, [hapticTrigger]);

  const handlePrevStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev - 1);
  }, [hapticTrigger]);

  const handleSourceAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'link_new_account') {
      onLinkAccount();
    } else {
      setSourceAccountId(value);
    }
  };

  useEffect(() => {
    if (selectedRecipient) {
      setReceiveCurrency(selectedRecipient.country.currency);
    }
  }, [selectedRecipient]);

  // For auto-selecting new external account
  const prevAccountsLength = useRef(accounts.length);
  useEffect(() => {
    if (accounts.length > prevAccountsLength.current) {
        const newAccount = accounts[accounts.length - 1];
        if (newAccount.type === AccountType.EXTERNAL_LINKED) {
            setSourceAccountId(newAccount.id);
        }
    }
    prevAccountsLength.current = accounts.length;
  }, [accounts]);

  useEffect(() => {
    if (step === 1 && rateLockCountdown > 0) {
        const timer = setInterval(() => setRateLockCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (step !== 1) {
        setRateLockCountdown(60); // Reset timer when leaving review step
    }
  }, [step, rateLockCountdown]);

  useEffect(() => {
    if (step === 3) { // Security Check step
        const interval = setInterval(() => {
            setSecurityCheckMessageIndex(prev => {
                if (prev >= securityCheckMessages.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => handleNextStep(), 500); // Move to success step
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
        return () => clearInterval(interval);
    }
  }, [step, handleNextStep]);
  
  const handleConfirmAndSend = useCallback(() => {
    if (!selectedRecipient || !sourceAccount) return;
    hapticTrigger();

    const newTransaction = createTransaction({
      accountId: sourceAccount.id,
      recipient: selectedRecipient,
      sendAmount: numericSendAmount,
      receiveAmount: receiveAmount,
      receiveCurrency: receiveCurrency,
      fee: fee,
      deliverySpeed: deliverySpeed,
      exchangeRate: exchangeRate,
      description: `Transfer to ${selectedRecipient.fullName}`,
      purpose
    });
    
    if(newTransaction) {
        setCreatedTransaction(newTransaction);
        handleNextStep(); // Move to Security Check
    }
  }, [createTransaction, deliverySpeed, exchangeRate, fee, hapticTrigger, handleNextStep, numericSendAmount, purpose, receiveAmount, receiveCurrency, selectedRecipient, sourceAccount]);

  const handlePinSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    setTimeout(() => { // Simulate API call
      if (pin === USER_PIN) {
        if(activeTab === 'send') handleConfirmAndSend();
        else if (activeTab === 'split') setIsSplitConfirmOpen(true);
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setIsAuthenticating(false);
      }
    }, 500);
  }, [hapticTrigger, pin, handleConfirmAndSend, activeTab]);

  const handleBiometricAuth = useCallback(async () => {
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        if(activeTab === 'send') handleConfirmAndSend();
        else if(activeTab === 'split') setIsSplitConfirmOpen(true);
    } catch (error) {
        console.error("Biometric auth failed", error);
        setPinError('Biometric authentication failed. Please use your PIN.');
        setIsAuthenticating(false);
    }
  }, [hapticTrigger, handleConfirmAndSend, activeTab]);
  
  useEffect(() => {
    if (step === 2 && securitySettings.biometricsEnabled && !authAttempted.current) {
      authAttempted.current = true;
      handleBiometricAuth();
    }
    if (step !== 2) authAttempted.current = false;
  }, [step, securitySettings.biometricsEnabled, handleBiometricAuth]);

  const handleStartOver = () => {
    hapticTrigger();
    setStep(0);
    setActiveTab('send');
    setSelectedRecipient(recipients.length > 0 ? recipients[0] : null);
    setSourceAccountId(internalAccounts.length > 0 ? internalAccounts[0].id : '');
    setSendAmount('');
    setPurpose(TRANSFER_PURPOSES[0]);
    setPin('');
    setPinError('');
    setCreatedTransaction(null);
  };
  
   const handleViewActivity = () => {
      onClose();
      setActiveView('history');
  };

  // ----- SPLIT PAYMENT LOGIC -----
    const availableRecipients = recipients.filter(r => !splitRecipients.some(sr => sr.id === r.id));
    const searchResults = availableRecipients.filter(r => r.fullName.toLowerCase().includes(recipientSearch.toLowerCase()) || r.nickname?.toLowerCase().includes(recipientSearch.toLowerCase()));

    const handleAddSplitRecipient = (recipient: Recipient) => {
        setSplitRecipients(prev => [...prev, recipient]);
        setRecipientSearch('');
        setShowRecipientDropdown(false);
    };

    const handleRemoveSplitRecipient = (id: string) => {
        setSplitRecipients(prev => prev.filter(r => r.id !== id));
        setCustomAmounts(prev => {
            const newAmounts = {...prev};
            delete newAmounts[id];
            return newAmounts;
        });
    };

    const handleCustomAmountChange = (id: string, value: string) => {
        setCustomAmounts(prev => ({...prev, [id]: value}));
    };

    const totalSplitAmount = parseFloat(splitAmount) || 0;
    const evenlySplitAmount = splitRecipients.length > 0 ? totalSplitAmount / splitRecipients.length : 0;
    const totalCustomAmount = Object.values(customAmounts).reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0);
    const splitAmountError = splitType === 'custom' && totalCustomAmount !== totalSplitAmount ? `Custom amounts must add up to ${totalSplitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.` : null;
    const isSplitInvalid = totalSplitAmount <= 0 || splitRecipients.length < 2 || !sourceAccount || totalSplitAmount > sourceAccount.balance || (splitType === 'custom' && totalCustomAmount !== totalSplitAmount);

    const handleConfirmSplit = () => {
        if(isSplitInvalid || !sourceAccount) return;
        setIsSplitConfirmOpen(true);
    }

    const handleExecuteSplit = () => {
        const splits = splitRecipients.map(r => ({
            recipient: r,
            amount: splitType === 'even' ? evenlySplitAmount : parseFloat(customAmounts[r.id]) || 0
        }));
        const success = onSplitTransaction({ sourceAccountId, splits, totalAmount: totalSplitAmount, purpose });
        setIsSplitConfirmOpen(false);
        if (success) {
            handleNextStep(); // Go to success view for split
        } else {
            // Handle error, maybe show a toast
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (recipientInputRef.current && !recipientInputRef.current.contains(event.target as Node)) {
                setShowRecipientDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  // ----- END SPLIT PAYMENT LOGIC -----

  const renderSendContent = () => {
    switch(step) {
      case 0:
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send Money</h2>
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700">Send From</label>
                <select value={sourceAccountId} onChange={handleSourceAccountChange} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                  {internalAccounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) </option> ))}
                  {externalAccounts.length > 0 && <optgroup label="External Accounts">
                    {externalAccounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.nickname || acc.type} </option> ))}
                  </optgroup>}
                  <option value="link_new_account">Link New Account...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Recipient</label>
                <button type="button" onClick={() => setIsRecipientSelectorOpen(true)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset flex items-center justify-between text-left">
                  {selectedRecipient ? (
                    <div className="flex items-center space-x-3">
                      <BankLogo bankName={selectedRecipient.bankName} className="w-6 h-6 rounded-md bg-white p-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">{selectedRecipient.nickname || selectedRecipient.fullName}</p>
                        <p className="text-xs text-slate-500">{selectedRecipient.bankName}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Select a recipient...</span>
                  )}
                  <span className="text-slate-500">▼</span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">You Send</label>
                <div className="mt-1 relative rounded-md shadow-digital-inset bg-slate-200 flex items-center">
                  <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full bg-transparent border-0 p-3 pr-4 text-lg font-mono text-slate-800 flex-grow" placeholder="0.00"/>
                  <div className="p-3 flex items-center space-x-2 border-l border-slate-300 pointer-events-none">
                     <img src={`https://flagcdn.com/w40/us.png`} alt="USD flag" className="w-5 h-auto" />
                    <span className="text-slate-500 font-semibold">USD</span>
                  </div>
                </div>
                {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
              </div>

              {/* Real-time conversion preview */}
              {numericSendAmount > 0 && selectedRecipient && !amountError && (
                  <div className="mt-4 animate-fade-in-up">
                      <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                              <div className="p-2 bg-slate-100 rounded-full shadow-digital">
                                  <img 
                                      src={`https://flagcdn.com/w40/${selectedRecipient.country.code.toLowerCase()}.png`} 
                                      alt={`${selectedRecipient.country.currency} flag`} 
                                      className="w-8 h-auto" 
                                  />
                              </div>
                              <div>
                                  <p className="text-sm text-slate-500">Recipient gets (approx.)</p>
                                  <p className="font-bold text-xl text-primary">
                                      {receiveAmount.toLocaleString('en-US', {
                                          style: 'currency',
                                          currency: selectedRecipient.country.currency,
                                      })}
                                  </p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-slate-500">Exchange Rate</p>
                              <p className="font-mono text-sm font-semibold text-slate-700">1 USD ≈ {exchangeRate.toFixed(4)} {selectedRecipient.country.currency}</p>
                          </div>
                      </div>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Speed</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDeliverySpeed('Standard')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Standard' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                        <p className="font-bold text-slate-800">Standard</p>
                        <p className="text-xs text-slate-500">~2-3 business days</p>
                        <p className="text-sm font-semibold text-primary mt-1">{STANDARD_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                    </button>
                     <button onClick={() => setDeliverySpeed('Express')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Express' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                        <p className="font-bold text-slate-800">Express</p>
                        <p className="text-xs text-slate-500">Within 24 hours</p>
                        <p className="text-sm font-semibold text-primary mt-1">{EXPRESS_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                    </button>
                </div>
              </div>
              <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-600">Total Debited:</span>
                    <span className="font-mono text-slate-800 font-semibold">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
              <button onClick={handleNextStep} disabled={isAmountInvalid || !selectedRecipient} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">
                Review Transfer
              </button>
            </div>
          </>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Review Your Transfer</h2>
            <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3 divide-y divide-slate-300">
                <div className="pt-2"> <span className="text-sm text-slate-500">From</span> <p className="font-semibold text-slate-800">{sourceAccount?.nickname || sourceAccount?.type}</p> </div>
                <div className="pt-3"> 
                    <span className="text-sm text-slate-500">To</span> 
                    <div className="flex items-center space-x-2">
                        {selectedRecipient && <BankLogo bankName={selectedRecipient.bankName} className="w-5 h-5 rounded-sm bg-white p-0.5" />}
                        <p className="font-semibold text-slate-800">{selectedRecipient?.fullName}</p>
                    </div>
                </div>
                <div className="pt-3"> <span className="text-sm text-slate-500">You Send</span> <p className="font-semibold text-slate-800">{numericSendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p> </div>
                <div className="pt-3"> <span className="text-sm text-slate-500">Recipient Gets</span> <p className="font-semibold text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</p> </div>
                 <div className="pt-3"> <span className="text-sm text-slate-500">Delivery</span> <p className="font-semibold text-slate-800">{deliverySpeed}</p> </div>
            </div>
             <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset text-center">
                 <p className="text-xs text-slate-500">Your exchange rate is locked for:</p>
                 <p className={`text-xl font-bold font-mono ${rateLockCountdown < 10 ? 'text-red-500' : 'text-slate-800'}`}>{Math.floor(rateLockCountdown / 60)}:{String(rateLockCountdown % 60).padStart(2, '0')}</p>
             </div>
             <div className="mt-6 flex space-x-3">
                <button onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                <button onClick={() => setIsSendConfirmOpen(true)} disabled={rateLockCountdown <= 0} className="w-full py-3 text-white bg-green-500 rounded-lg font-semibold shadow-md disabled:bg-green-300"> Confirm & Authorize </button>
            </div>
          </div>
        );
      case 2:
          return (
              <div className="text-center p-4">
                  <h2 className="text-2xl font-bold text-slate-800">Authorize Payment</h2>
                  <form onSubmit={handlePinSubmit}>
                      <label className="text-slate-600 my-4 block">Please enter your 4-digit security PIN.</label>
                      <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-48 mx-auto bg-slate-200 border-0 p-3 text-center text-3xl tracking-[.75em] rounded-md shadow-digital-inset" maxLength={4} placeholder="----" autoFocus />
                      {pinError && <p className="mt-2 text-sm text-red-500">{pinError}</p>}
                       <div className="mt-6 flex space-x-3">
                          <button type="button" onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital" disabled={isAuthenticating}>Back</button>
                          <button type="submit" disabled={pin.length !== 4 || isAuthenticating} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50"> Authorize & Send </button>
                      </div>
                  </form>
              </div>
          );
      case 3: // Security Check
        return (
            <div className="text-center p-8">
                <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                <h3 className="mt-4 text-xl font-bold text-slate-800">{securityCheckMessages[securityCheckMessageIndex]}</h3>
                <p className="text-slate-600 mt-2">This is a standard security procedure to protect your account.</p>
            </div>
        );
      default: return null;
    }
  };

  const renderSplitContent = () => {
    switch(step) {
        case 0: return (
             <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Split Payment</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Send From</label>
                    <select value={sourceAccountId} onChange={handleSourceAccountChange} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                        {internalAccounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) </option> ))}
                    </select>
                </div>
                <div ref={recipientInputRef}>
                    <label className="block text-sm font-medium text-slate-700">Recipients ({splitRecipients.length})</label>
                    <div className="mt-1 flex flex-wrap gap-2 items-center p-2 bg-slate-200 rounded-md shadow-digital-inset">
                        {splitRecipients.map(r => (
                            <div key={r.id} className="bg-primary/20 text-primary-800 text-sm font-semibold px-2 py-1 rounded flex items-center gap-1">
                                {r.nickname || r.fullName} <button onClick={() => handleRemoveSplitRecipient(r.id)}><XCircleIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                        <input type="text" value={recipientSearch} onFocus={() => setShowRecipientDropdown(true)} onChange={e => setRecipientSearch(e.target.value)} placeholder={splitRecipients.length === 0 ? "Search recipients..." : "Add another..."} className="flex-grow bg-transparent outline-none p-1" />
                    </div>
                    {showRecipientDropdown && searchResults.length > 0 && (
                        <div className="relative">
                            <ul className="absolute z-10 w-full bg-slate-100 border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                                {searchResults.map(r => (
                                    <li key={r.id} onClick={() => handleAddSplitRecipient(r)} className="p-3 hover:bg-slate-200 cursor-pointer text-sm">{r.fullName} ({r.nickname})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Total Amount</label>
                    <input type="number" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Split Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSplitType('even')} className={`p-3 rounded-lg transition-all ${splitType === 'even' ? 'shadow-digital-inset' : 'shadow-digital'}`}>Split Evenly</button>
                        <button onClick={() => setSplitType('custom')} className={`p-3 rounded-lg transition-all ${splitType === 'custom' ? 'shadow-digital-inset' : 'shadow-digital'}`}>Custom Amounts</button>
                    </div>
                </div>
                {splitType === 'even' && splitRecipients.length > 0 && (
                    <div className="p-3 bg-slate-200 rounded-lg shadow-digital-inset text-center text-slate-600">
                        Each person will receive <span className="font-bold text-slate-800">{evenlySplitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                )}
                {splitType === 'custom' && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {splitRecipients.map(r => (
                            <div key={r.id} className="flex items-center gap-2">
                                <span className="flex-grow text-sm font-medium">{r.nickname || r.fullName}</span>
                                <input type="number" value={customAmounts[r.id] || ''} onChange={e => handleCustomAmountChange(r.id, e.target.value)} placeholder="0.00" className="w-28 p-2 rounded-md shadow-digital-inset" />
                            </div>
                        ))}
                         {splitAmountError && <p className="text-red-500 text-xs text-center">{splitAmountError}</p>}
                    </div>
                )}
                <button onClick={handleConfirmSplit} disabled={isSplitInvalid} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">Review Split</button>
            </div>
        );
        case 1: // Success for split
         return (
             <div className="text-center p-8 flex flex-col items-center justify-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Split Payment Sent!</h3>
                <p className="text-sm text-slate-600">{totalSplitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} was sent to {splitRecipients.length} people.</p>
                <button onClick={handleStartOver} className="mt-6 w-full py-3 bg-primary text-white rounded-lg">Send Another Payment</button>
            </div>
         );
        default: return null;
    }
  };


  if (activeTab === 'send' && step === 4) {
    if (!liveTransaction || !sourceAccount) {
        return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4"><SpinnerIcon className="w-12 h-12 text-primary"/></div>;
    }
    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 z-20"><XIcon className="w-6 h-6"/></button>
                 <PaymentReceipt 
                    transaction={liveTransaction}
                    sourceAccount={sourceAccount}
                    onStartOver={handleStartOver}
                    onViewActivity={handleViewActivity}
                    onAuthorizeTransaction={onAuthorizeTransaction}
                    phone={userProfile.phone}
                    onContactSupport={onContactSupport}
                    onPayFee={onPayFee}
                />
             </div>
        </div>
    );
  }

  return (
    <>
      {isRecipientSelectorOpen && (
        <RecipientSelector 
          recipients={recipients}
          onSelect={(recipient) => {
            setSelectedRecipient(recipient);
            setIsRecipientSelectorOpen(false);
          }}
          onClose={() => setIsRecipientSelectorOpen(false)}
        />
      )}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-up">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
              
              <div className="mb-6 border-b border-slate-200">
                  <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                      <button onClick={() => setActiveTab('send')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'send' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Send</button>
                      <button onClick={() => setActiveTab('split')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'split' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Split</button>
                      <button onClick={() => setActiveTab('deposit')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'deposit' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Deposit Check</button>
                  </nav>
              </div>

              {activeTab === 'send' && renderSendContent()}
              {activeTab === 'split' && renderSplitContent()}
              {activeTab === 'deposit' && (
                  <CheckDepositFlow accounts={internalAccounts} onDepositCheck={onDepositCheck} />
              )}

              {isSplitConfirmOpen && (
                  <TransferConfirmationModal 
                      onClose={() => setIsSplitConfirmOpen(false)}
                      onConfirm={handleExecuteSplit}
                      details={
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>From:</span> <span className="font-semibold">{sourceAccount?.nickname}</span></div>
                              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span> <span>{totalSplitAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span></div>
                              <h4 className="font-semibold pt-2">Recipients:</h4>
                              <ul className="text-xs max-h-24 overflow-y-auto">
                                  {splitRecipients.map(r => (
                                      <li key={r.id} className="flex justify-between">
                                          <span>{r.nickname || r.fullName}</span>
                                          <span className="font-mono">{splitType === 'even' ? evenlySplitAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) : (parseFloat(customAmounts[r.id]) || 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      }
                  />
              )}

              {isSendConfirmOpen && (
                <TransferConfirmationModal
                    onClose={() => setIsSendConfirmOpen(false)}
                    onConfirm={() => {
                        setIsSendConfirmOpen(false);
                        handleNextStep();
                    }}
                    details={
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex justify-between"><span>From:</span> <span className="font-semibold">{sourceAccount?.nickname || sourceAccount?.type}</span></div>
                            <div className="flex justify-between"><span>To:</span> <span className="font-semibold">{selectedRecipient?.fullName}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2"><span>Amount Sent:</span> <span className="font-mono">{numericSendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                            <div className="flex justify-between"><span>Fee:</span> <span className="font-mono">{fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2 text-slate-800"><span>Total Debited:</span> <span className="font-mono">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                            <div className="flex justify-between font-bold text-primary"><span>Recipient Gets:</span> <span className="font-mono">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</span></div>
                        </div>
                    }
                />
              )}
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
    </>
  );
};