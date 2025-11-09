
import React from 'react';
import { Transaction, TransactionStatus } from '../types';
import { CheckCircleIcon, ClockIcon } from './Icons';

interface TransactionTrackerProps {
  transaction: Transaction;
}

const steps = [
  TransactionStatus.SUBMITTED,
  TransactionStatus.CONVERTING,
  TransactionStatus.IN_TRANSIT,
  TransactionStatus.FUNDS_ARRIVED,
];

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ transaction }) => {
  const { status, statusTimestamps } = transaction;
  const currentStepIndex = steps.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFinalStepCompleted = step === TransactionStatus.FUNDS_ARRIVED && isCurrent;
          const timestamp = statusTimestamps[step as keyof typeof statusTimestamps];

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted || isFinalStepCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted || isFinalStepCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <ClockIcon className="w-6 h-6" />
                  )}
                </div>
                <p
                  className={`mt-2 text-xs text-center font-medium w-24 ${
                    isCompleted || isCurrent || isFinalStepCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step}
                </p>
                {timestamp && (
                  <div className="text-xs text-slate-500 mt-1 text-center">
                    <p>{timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p>{timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 mt-5 transition-colors duration-300 ${
                    isCompleted || isFinalStepCompleted ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
