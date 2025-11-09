import React from 'react';
import { Transaction, TransactionStatus } from '../types';
import { CheckCircleIcon, UserGroupIcon, NetworkIcon, GlobeAltIcon, BankIcon, DocumentCheckIcon, ExclamationTriangleIcon, SpinnerIcon } from './Icons';

interface LiveTransactionViewProps {
  transaction: Transaction;
  currentStatus: TransactionStatus;
}

export const LiveTransactionView: React.FC<LiveTransactionViewProps> = ({ transaction, currentStatus }) => {
    const statusMap = {
        [TransactionStatus.SUBMITTED]: { label: 'Payment Initiated', icon: <UserGroupIcon className="w-6 h-6" /> },
        [TransactionStatus.PROCESSING]: { label: 'Processing', icon: <SpinnerIcon className="w-6 h-6" /> },
        [TransactionStatus.CONVERTING]: { label: 'Processing FX', icon: <NetworkIcon className="w-6 h-6" /> },
        [TransactionStatus.IN_TRANSIT]: { label: 'Sent to Network', icon: <GlobeAltIcon className="w-6 h-6" /> },
        [TransactionStatus.FLAGGED_AWAITING_CLEARANCE]: { label: 'IMF Clearance', icon: <ExclamationTriangleIcon className="w-6 h-6" /> },
        [TransactionStatus.CLEARED]: { label: 'Compliance Cleared', icon: <DocumentCheckIcon className="w-6 h-6" /> },
        [TransactionStatus.FUNDS_ARRIVED]: { label: 'Delivered', icon: <BankIcon className="w-6 h-6" /> },
        [TransactionStatus.PENDING_DEPOSIT]: { label: 'Pending Deposit', icon: <BankIcon className="w-6 h-6" /> },
    };

    const flowOrder: TransactionStatus[] = [
        TransactionStatus.SUBMITTED,
        TransactionStatus.PROCESSING,
        TransactionStatus.CONVERTING,
        TransactionStatus.IN_TRANSIT,
        TransactionStatus.FLAGGED_AWAITING_CLEARANCE,
        TransactionStatus.CLEARED,
        TransactionStatus.FUNDS_ARRIVED,
    ].filter(status => {
        const wasFlagged = transaction.statusTimestamps[TransactionStatus.FLAGGED_AWAITING_CLEARANCE];
        if (!wasFlagged && (status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE || status === TransactionStatus.CLEARED)) {
            return false;
        }
        return true;
    });

    const currentStepIndex = flowOrder.indexOf(currentStatus);
    const isComplete = currentStatus === TransactionStatus.FUNDS_ARRIVED;
  
    return (
    <div className="w-full font-sans my-8">
      <div className="flex justify-between items-start text-center px-2">
        {flowOrder.map((status, index) => {
          const stepInfo = statusMap[status];
          if (!stepInfo) return null;

          const isStepCompleted = index < currentStepIndex || isComplete;
          const isStepCurrent = index === currentStepIndex && !isComplete;
          const isFlaggedStep = status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE;

          let colorClasses = 'bg-slate-800 text-slate-500 shadow-inner';
          if (isStepCompleted) {
              colorClasses = 'bg-green-500/20 text-green-300';
          } else if (isStepCurrent) {
              colorClasses = isFlaggedStep ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500 animate-pulse' : 'bg-primary/20 text-primary-300 ring-2 ring-primary animate-pulse';
          }

          return (
            <div key={status} className="w-1/5 px-1 flex-1 flex flex-col items-center relative">
                <div className="relative w-full flex items-center">
                    {index > 0 && <div className={`flex-1 h-1 transition-colors duration-1000 ${index <= currentStepIndex || isComplete ? 'bg-primary' : 'bg-slate-700'}`}></div>}
                </div>
              <div className={`-mt-6 mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-2 z-10 ${colorClasses}`}>
                {isStepCompleted ? <CheckCircleIcon className="w-7 h-7 animate-status-icon-pop" /> : stepInfo.icon}
              </div>
              <p className={`text-xs font-bold transition-colors duration-500 ${isStepCompleted || isStepCurrent ? 'text-slate-200' : 'text-slate-500'}`}>
                {stepInfo.label}
              </p>
              {status === TransactionStatus.CLEARED && transaction.taxId && (
                  <div className="mt-2 text-center animate-fade-in-up">
                      <img src="https://i.imgur.com/g0t6K3B.png" alt="Authorized Stamp" className="w-20 h-auto opacity-80 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono mt-1">{transaction.taxId}</p>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};