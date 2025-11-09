import React, { useMemo } from 'react';
import { SubscriptionService, UtilityBill, UtilityBiller, Account, SubscriptionServiceType, AccountType } from '../types';
import { 
    CalendarDaysIcon, 
    WifiIcon, 
    TvIcon, 
    SatelliteDishIcon, 
    LightningBoltIcon, 
    BankIcon
} from './Icons';

interface RecurringPaymentsProps {
    subscriptions: SubscriptionService[];
    utilityBills: UtilityBill[];
    utilityBillers: UtilityBiller[];
    accounts: Account[];
    onToggleSubscriptionAutopay: (subscriptionId: string) => void;
    onToggleUtilityAutopay: (billId: string) => void;
}

const getSubscriptionIcon = (type: SubscriptionServiceType) => {
    switch (type) {
        case SubscriptionServiceType.INTERNET: return <WifiIcon className="w-6 h-6 text-primary" />;
        case SubscriptionServiceType.TV: return <TvIcon className="w-6 h-6 text-primary" />;
        case SubscriptionServiceType.SATELLITE: return <SatelliteDishIcon className="w-6 h-6 text-primary" />;
        default: return <TvIcon className="w-6 h-6 text-primary" />;
    }
};

const RecurringItemCard: React.FC<{
    icon: React.ReactNode;
    name: string;
    plan?: string;
    amount: number;
    nextDate: Date;
    sourceAccountName: string;
    onToggle: () => void;
}> = ({ icon, name, plan, amount, nextDate, sourceAccountName, onToggle }) => {

    const isOverdue = !new Date() < nextDate;

    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-md shadow-digital">
                        {icon}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{name}</p>
                        {plan && <p className="text-xs text-slate-500">{plan}</p>}
                    </div>
                </div>
                <p className="font-bold text-lg text-slate-800 font-mono">
                    {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
                <div>
                    <p className="text-xs font-semibold text-slate-500">Next Payment</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                        {nextDate.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">From: {sourceAccountName}</p>
                </div>
                <button
                    onClick={onToggle}
                    className="px-4 py-2 text-sm font-semibold rounded-lg shadow-digital active:shadow-digital-inset bg-yellow-400/20 text-yellow-800 hover:bg-yellow-400/40 transition-colors"
                >
                    Pause Autopay
                </button>
            </div>
        </div>
    );
};


export const RecurringPayments: React.FC<RecurringPaymentsProps> = ({ subscriptions, utilityBills, utilityBillers, accounts, onToggleSubscriptionAutopay, onToggleUtilityAutopay }) => {

    const recurringSubscriptions = useMemo(() => subscriptions.filter(s => s.isRecurring && !s.isPaid), [subscriptions]);
    const recurringBills = useMemo(() => utilityBills.filter(b => b.isRecurring && !b.isPaid), [utilityBills]);

    const totalMonthlySubscriptions = useMemo(() => recurringSubscriptions.reduce((sum, s) => sum + s.amount, 0), [recurringSubscriptions]);
    const totalMonthlyBills = useMemo(() => recurringBills.reduce((sum, b) => sum + b.amount, 0), [recurringBills]);
    const totalMonthly = totalMonthlySubscriptions + totalMonthlyBills;
    
    const primaryAccount = accounts.find(a => a.type === AccountType.CHECKING) || accounts[0];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Recurring Payments</h2>
                <p className="text-sm text-slate-500 mt-1">Manage all your automatic subscriptions and bill payments.</p>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 text-center">
                 <h3 className="text-xl font-bold text-slate-800">Total Monthly Autopay</h3>
                 <p className="text-5xl font-bold text-primary mt-2 font-mono">{totalMonthly.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                 <p className="text-sm text-slate-500 mt-1">{recurringSubscriptions.length + recurringBills.length} active recurring payments</p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Subscriptions ({recurringSubscriptions.length})</h3>
                    {recurringSubscriptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {recurringSubscriptions.map(sub => (
                               <RecurringItemCard 
                                   key={`sub-${sub.id}`}
                                   icon={getSubscriptionIcon(sub.type)}
                                   name={sub.provider}
                                   plan={sub.plan}
                                   amount={sub.amount}
                                   nextDate={sub.dueDate}
                                   sourceAccountName={primaryAccount?.nickname || 'Checking'}
                                   onToggle={() => onToggleSubscriptionAutopay(sub.id)}
                               />
                           ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4 bg-slate-200 rounded-lg shadow-digital-inset">No active recurring subscriptions.</p>
                    )}
                </div>

                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Utilities ({recurringBills.length})</h3>
                    {recurringBills.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {recurringBills.map(bill => {
                               const biller = utilityBillers.find(b => b.id === bill.billerId);
                               if (!biller) return null;
                               const BillerIcon = biller.icon || BankIcon;
                               return (
                                   <RecurringItemCard 
                                       key={`bill-${bill.id}`}
                                       icon={<BillerIcon className="w-6 h-6 text-primary" />}
                                       name={biller.name}
                                       amount={bill.amount}
                                       nextDate={bill.dueDate}
                                       sourceAccountName={primaryAccount?.nickname || 'Checking'}
                                       onToggle={() => onToggleUtilityAutopay(bill.id)}
                                   />
                               )
                           })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4 bg-slate-200 rounded-lg shadow-digital-inset">No active recurring utility bills.</p>
                    )}
                </div>
            </div>
        </div>
    );
};