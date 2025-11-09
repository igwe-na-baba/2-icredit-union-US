import React, { useState } from 'react';
import { View, Transaction } from '../types';
import { CreditCardIcon, QrCodeIcon, SendIcon, Cog8ToothIcon, NfcIcon, PayPalIcon, CashAppIcon, ZelleIcon } from './Icons';
import { TapToPayModal } from './TapToPayModal';

interface DigitalWalletProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
    linkedServices: Record<string, string>;
    transactions: Transaction[];
}

const serviceIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    PayPal: PayPalIcon,
    CashApp: CashAppIcon,
    Zelle: ZelleIcon,
};


export const DigitalWallet: React.FC<DigitalWalletProps> = ({ setActiveView, onOpenSendMoneyFlow, linkedServices, transactions }) => {
    const [isTapToPayOpen, setIsTapToPayOpen] = useState(false);

    const recentTransactions = transactions.slice(0, 5);

    const ActionButton: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, icon, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-slate-300/50 transition-colors">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center shadow-digital text-primary">
                {icon}
            </div>
            <span className="text-xs font-semibold text-slate-700">{title}</span>
        </button>
    );

    return (
        <>
            {isTapToPayOpen && <TapToPayModal onClose={() => setIsTapToPayOpen(false)} />}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Digital Wallet</h2>
                    <p className="text-sm text-slate-500 mt-1">Your central hub for payments and services.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Wallet Card */}
                    <div className="lg:col-span-2 bg-slate-200 rounded-2xl shadow-digital p-6 space-y-6">
                        <div 
                            className="relative w-full max-w-md mx-auto rounded-2xl text-white shadow-lg overflow-hidden"
                            style={{ height: '212px' }}
                        >
                            <div 
                                className="absolute inset-0 bg-cover bg-center animate-card-zoom"
                                style={{ backgroundImage: `url('https://images.pexels.com/photos/20042457/pexels-photo-20042457/free-photo-of-a-close-up-of-a-credit-card-with-a-chip.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`}}
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                            <div className="relative z-10 p-6 flex flex-col h-full">
                                <p className="font-semibold">iCredit Union® Debit</p>
                                <div className="flex-grow"></div>
                                <p className="font-mono text-2xl tracking-widest">•••• •••• •••• 4321</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <ActionButton title="Tap to Pay" icon={<NfcIcon className="w-6 h-6" />} onClick={() => setIsTapToPayOpen(true)} />
                            <ActionButton title="Scan QR" icon={<QrCodeIcon className="w-6 h-6" />} onClick={() => setActiveView('qrScanner')} />
                            <ActionButton title="Send Money" icon={<SendIcon className="w-6 h-6" />} onClick={() => onOpenSendMoneyFlow('send')} />
                            <ActionButton title="Manage Cards" icon={<Cog8ToothIcon className="w-6 h-6" />} onClick={() => setActiveView('cards')} />
                        </div>
                    </div>

                    {/* Linked Services & Recent Activity */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Linked Services</h3>
                            <div className="space-y-3">
                                {Object.entries(linkedServices).map(([name, identifier]) => {
                                    const Icon = serviceIcons[name] || CreditCardIcon;
                                    return (
                                         <div key={name} className="flex items-center space-x-3 p-3 bg-slate-200 rounded-lg shadow-digital-inset">
                                            <Icon className="w-8 h-8"/>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{name}</p>
                                                <p className="text-xs text-slate-500">{identifier}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                 <button onClick={() => setActiveView('integrations')} className="w-full text-sm font-semibold text-primary hover:underline pt-2">Manage Integrations</button>
                            </div>
                        </div>

                        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                               {recentTransactions.map(tx => (
                                   <div key={tx.id} className="flex justify-between items-center text-sm">
                                       <div>
                                           <p className="font-semibold text-slate-800">{tx.recipient.nickname || tx.recipient.fullName}</p>
                                           <p className="text-xs text-slate-500">{new Date(tx.statusTimestamps.Submitted).toLocaleDateString()}</p>
                                       </div>
                                       <p className="font-mono font-semibold text-slate-700">-{tx.sendAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                                   </div>
                               ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};