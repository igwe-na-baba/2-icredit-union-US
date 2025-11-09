import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Account, TransactionStatus } from '../types';
import { USER_PROFILE } from '../constants';
import { LiveTransactionView } from './LiveTransactionView';
import { 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    UserCircleIcon,
    ArrowRightIcon,
    BankIcon,
    ClipboardDocumentIcon,
    QrCodeIcon,
    LicensedPartnerIcon,
    DataEncryptionIcon,
    ComplianceIcon,
    SpinnerIcon,
    ScaleIcon,
} from './Icons';
import { DownloadableReceipt } from './DownloadableReceipt';
import { SmsConfirmation } from './SmsConfirmation';
import { AuthorizationWarningModal } from './AuthorizationWarningModal';
import { CongratulationsOverlay } from './CongratulationsOverlay';


declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptProps {
    transaction: Transaction;
    sourceAccount: Account;
    onStartOver: () => void;
    onViewActivity: () => void;
    phone?: string;
    onContactSupport: () => void;
    onPayFee: (transaction: Transaction) => void;
    onAuthorizeTransaction: (transactionId: string) => void;
}

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="flex justify-between items-start py-2.5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-sm text-slate-200 text-right ${isMono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
    </div>
);

const FinalReceiptView: React.FC<{ transaction: Transaction; sourceAccount: Account }> = ({ transaction, sourceAccount }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;

    return (
        <div className="relative p-6 bg-slate-800/50 rounded-lg border border-slate-700/50 animate-fade-in-up">
            <div className="text-center mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto" />
                <h3 className="text-xl font-bold text-slate-100 mt-2">Transaction Completed</h3>
                <p className="text-slate-400 text-sm">
                    {transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to {transaction.recipient.fullName}
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center my-4">
                {/* Sender */}
                <div className="bg-slate-900/50 p-4 rounded-lg shadow-inner text-center">
                     <UserCircleIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
                     <p className="font-bold text-slate-200">{USER_PROFILE.name}</p>
                     <p className="text-xs text-slate-400">{sourceAccount.nickname}</p>
                     <p className="text-xs text-slate-500 font-mono">{sourceAccount.accountNumber}</p>
                </div>
                {/* Arrow */}
                <div className="text-center">
                    <ArrowRightIcon className="w-6 h-6 text-slate-500"/>
                </div>
                {/* Recipient */}
                <div className="bg-slate-900/50 p-4 rounded-lg shadow-inner text-center">
                    <BankIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
                    <p className="font-bold text-slate-200">{transaction.recipient.fullName}</p>
                    <p className="text-xs text-slate-400">{transaction.recipient.bankName}</p>
                    <p className="text-xs text-slate-500 font-mono">{transaction.recipient.accountNumber}</p>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-900/50 rounded-lg shadow-inner space-y-2 divide-y divide-slate-700/50 mb-4">
                <DetailRow label="Amount Sent" value={transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                <DetailRow label="Transfer Fee" value={transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                {transaction.exchangeRate !== 1 && (
                    <>
                        <DetailRow label="Exchange Rate" value={`1 USD ≈ ${transaction.exchangeRate.toFixed(4)} ${transaction.receiveCurrency}`} isMono />
                        <DetailRow label="Recipient Receives" value={transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })} isMono />
                    </>
                )}
                <DetailRow label="Total Paid" value={<span className="font-bold text-lg">{totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>} isMono />
            </div>

            {/* Transaction Details */}
             <div className="p-4 bg-slate-900/50 rounded-lg shadow-inner space-y-2 divide-y divide-slate-700/50">
                <DetailRow label="Reference #" value={transaction.id} isMono />
                {transaction.wireReferenceNumber && <DetailRow label="Wire Reference" value={transaction.wireReferenceNumber} isMono />}
                <DetailRow label="Date & Time" value={transaction.statusTimestamps.Submitted.toLocaleString()} />
                <DetailRow label="Purpose" value={transaction.purpose} />
                {transaction.intermediaryBank && (
                     <DetailRow label="Intermediary Bank" value={
                         <div className="text-right">
                             {transaction.intermediaryBankName && <p>{transaction.intermediaryBankName}</p>}
                             {transaction.intermediaryBank && <p className="font-mono">{transaction.intermediaryBank}</p>}
                             {transaction.intermediaryBankAddress && <p className="text-xs">{transaction.intermediaryBankAddress}</p>}
                         </div>
                     } />
                )}
            </div>
        </div>
    );
};


export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ transaction: initialTransaction, sourceAccount, onStartOver, onViewActivity, phone, onContactSupport, onPayFee, onAuthorizeTransaction }) => {
    const [transaction, setTransaction] = useState(initialTransaction);
    const [currentStatus, setCurrentStatus] = useState(TransactionStatus.SUBMITTED);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const timeoutsRef = useRef<number[]>([]);

    useEffect(() => {
        setTransaction(initialTransaction);
        if (initialTransaction.status === TransactionStatus.CLEARED && currentStatus !== TransactionStatus.CLEARED) {
             setCurrentStatus(TransactionStatus.CLEARED);
             setShowAuthModal(false);
             setShowCongrats(true);
             const timer = window.setTimeout(() => setShowCongrats(false), 3000);
             timeoutsRef.current.push(timer);
        }
    }, [initialTransaction, currentStatus]);

    useEffect(() => {
        const clearTimeouts = () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
        };

        const wasFlagged = !!transaction.statusTimestamps[TransactionStatus.FLAGGED_AWAITING_CLEARANCE];
        const isCleared = transaction.status === TransactionStatus.CLEARED;

        const scheduleUpdate = (newStatus: TransactionStatus, delay: number) => {
            const timer = window.setTimeout(() => {
                setCurrentStatus(newStatus);
            }, delay);
            timeoutsRef.current.push(timer);
        };
        
        clearTimeouts();
        setCurrentStatus(TransactionStatus.SUBMITTED);
        
        if (isCleared) {
             setCurrentStatus(TransactionStatus.CLEARED);
             scheduleUpdate(TransactionStatus.FUNDS_ARRIVED, 3000);
        } else {
            scheduleUpdate(TransactionStatus.PROCESSING, 3000);
            scheduleUpdate(TransactionStatus.CONVERTING, 6000);
            scheduleUpdate(TransactionStatus.IN_TRANSIT, 9000);
            
            if (wasFlagged) {
                const timer = window.setTimeout(() => {
                    setCurrentStatus(TransactionStatus.FLAGGED_AWAITING_CLEARANCE);
                    setShowAuthModal(true);
                }, 15000); // Increased wait time for realism
                timeoutsRef.current.push(timer);
            } else {
                scheduleUpdate(TransactionStatus.FUNDS_ARRIVED, 12000);
            }
        }

        return clearTimeouts;
    }, [transaction.id, transaction.statusTimestamps, transaction.status]);


    const handleDownloadReceipt = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [800, canvas.height * (800 / canvas.width)]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
                    pdf.save(`iCU_Receipt_${transaction.id}.pdf`);
                    setIsGeneratingPdf(false);
                });
            } else {
                console.error('Could not generate PDF.');
                setIsGeneratingPdf(false);
            }
        }, 100);
    };

    const isFinalStep = currentStatus === TransactionStatus.FUNDS_ARRIVED;

    return (
        <>
            {showAuthModal && <AuthorizationWarningModal transactionId={transaction.id} onAuthorize={onAuthorizeTransaction} onClose={() => {}} onContactSupport={onContactSupport} />}
            {showCongrats && <CongratulationsOverlay />}
            <div className="text-center">
                {isFinalStep ? (
                    <>
                        {/* FinalReceiptView replaces this section */}
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-bold text-slate-100">Transaction in Progress...</h3>
                        <p className="text-slate-400 mt-1">We'll notify you once the funds have arrived.</p>
                    </>
                )}
            </div>

            {isFinalStep ? (
                <div className="my-6">
                    <FinalReceiptView transaction={transaction} sourceAccount={sourceAccount} />
                </div>
            ) : (
                <LiveTransactionView transaction={transaction} currentStatus={currentStatus} />
            )}

            {phone && isFinalStep && <SmsConfirmation transaction={transaction} phone={phone} />}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
                <button onClick={onStartOver} className="py-3 bg-white/10 text-slate-200 rounded-lg flex items-center justify-center space-x-2"><ArrowPathIcon className="w-5 h-5"/> <span>Start New Transfer</span></button>
                <button onClick={onViewActivity} className="py-3 bg-white/10 text-slate-200 rounded-lg">View Activity</button>
                <button onClick={handleDownloadReceipt} disabled={isGeneratingPdf} className="py-3 bg-primary text-white rounded-lg flex items-center justify-center space-x-2">
                   {isGeneratingPdf ? <SpinnerIcon className="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5"/>} 
                   <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>
            </div>
            
            {isGeneratingPdf && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div id={`receipt-${transaction.id}`}>
                        <DownloadableReceipt transaction={transaction} sourceAccount={sourceAccount} />
                    </div>
                </div>
            )}
        </>
    );
};