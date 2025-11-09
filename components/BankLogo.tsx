import React, { useState, useEffect, useMemo } from 'react';
import { BANKS_BY_COUNTRY } from '../constants';
import { BankIcon } from './Icons';

// This map is created once and provides efficient lookups
const bankDomainMap = new Map<string, string>();
Object.values(BANKS_BY_COUNTRY).flat().forEach(bank => {
    if (!bankDomainMap.has(bank.name)) {
        bankDomainMap.set(bank.name, bank.domain);
    }
});

interface BankLogoProps {
    bankName: string;
    className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankName, className }) => {
    const [hasError, setHasError] = useState(false);
    const domain = useMemo(() => bankDomainMap.get(bankName), [bankName]);

    useEffect(() => {
        setHasError(false);
    }, [domain]);

    if (!domain || hasError) {
        return (
            <div className={`${className} bg-slate-300 flex items-center justify-center`}>
                <BankIcon className="w-4/5 h-4/5 text-slate-500" />
            </div>
        );
    }

    return (
        <img
            src={`https://logo.clearbit.com/${domain}`}
            alt={`${bankName} logo`}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

export const getBankIcon = (bankName: string): React.ComponentType<{ className?: string }> => {
  return (props: { className?: string }) => <BankLogo bankName={bankName} {...props} />;
};