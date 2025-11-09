import React, { useState, useMemo, useEffect } from 'react';
import { BANKS_BY_COUNTRY } from '../constants';
import { SearchIcon, XIcon } from './Icons';
import { getBankIcon } from './BankLogo';
import { Recipient } from '../types';

interface Bank {
    name: string;
    domain: string;
}

interface BankSelectorProps {
    countryCode: string;
    onSelect: (bankName: string) => void;
    onClose: () => void;
    recipients: Recipient[];
}

const bankDomainMap = new Map<string, string>();
Object.values(BANKS_BY_COUNTRY).flat().forEach(bank => {
    if (!bankDomainMap.has(bank.name)) {
        bankDomainMap.set(bank.name, bank.domain);
    }
});

export const BankSelector: React.FC<BankSelectorProps> = ({ countryCode, onSelect, onClose, recipients }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const favoriteBanks = useMemo(() => {
        const bankNames = recipients.map(r => r.bankName).filter(name => !name.toLowerCase().includes('icredit'));
        // FIX: Argument of type 'unknown' is not assignable to parameter of type 'string'.
        // The spread operator on a Set was likely being inferred as `unknown[]`. Cast to string[] to fix.
        return ([...new Set(bankNames)] as string[]).slice(0, 4)
            .map(name => ({ name, domain: bankDomainMap.get(name) || '' }))
            .filter(bank => bank.domain); // Only show if we have a domain/logo
    }, [recipients]);

    const allBanks = useMemo(() => {
        const countryBanks = BANKS_BY_COUNTRY[countryCode] || [];
        const otherBanks = (BANKS_BY_COUNTRY['US'] || []).filter(b => countryCode !== 'US');
        const all = [...countryBanks, ...otherBanks];
        const uniqueBanks = Array.from(new Map(all.map(b => [b.name, b])).values());
        
        return uniqueBanks.filter(bank =>
            bank.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countryCode, searchTerm]);

    const handleSelect = (bank: Bank) => {
        onSelect(bank.name);
        onClose();
    };

    const BankButton: React.FC<{ bank: Bank }> = ({ bank }) => {
        const BankLogoComponent = getBankIcon(bank.name);
        return (
            <button
                onClick={() => handleSelect(bank)}
                className="w-full flex items-center space-x-4 p-4 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
            >
                <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center p-1 shadow-md">
                    <BankLogoComponent className="w-full h-full object-contain" />
                </div>
                <p className="font-semibold">{bank.name}</p>
            </button>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Select a Bank</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 relative">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-7 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a bank..."
                        className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-3 pl-10 rounded-lg shadow-inner"
                        autoFocus
                    />
                </div>
                <ul className="flex-1 overflow-y-auto">
                    {favoriteBanks.length > 0 && searchTerm.length === 0 && (
                        <>
                            <h4 className="px-4 pt-3 pb-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favorites</h4>
                            {favoriteBanks.map(bank => (
                                <li key={bank.name}><BankButton bank={bank} /></li>
                            ))}
                            <h4 className="px-4 pt-3 pb-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All Banks</h4>
                        </>
                    )}
                    {allBanks.map(bank => (
                        <li key={bank.name}><BankButton bank={bank} /></li>
                    ))}
                </ul>
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
