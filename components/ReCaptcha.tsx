import React, { useState } from 'react';
import { RecaptchaIcon, SpinnerIcon, CheckCircleIcon } from './Icons';

interface ReCaptchaProps {
    onVerified: (isVerified: boolean) => void;
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerified }) => {
    const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

    const handleCheckboxChange = () => {
        if (status === 'idle') {
            setStatus('verifying');
            // Simulate verification delay
            setTimeout(() => {
                setStatus('verified');
                onVerified(true);
            }, 1500);
        }
    };

    const getStatusContent = () => {
        switch (status) {
            case 'verifying':
                return <SpinnerIcon className="w-5 h-5 text-primary" />;
            case 'verified':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'idle':
            default:
                return (
                    <input
                        type="checkbox"
                        checked={false}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 rounded border-slate-400 bg-slate-200 text-primary focus:ring-primary cursor-pointer"
                    />
                );
        }
    };

    return (
        <div className="bg-slate-200/50 p-3 rounded-lg flex items-center justify-between shadow-digital-inset my-4">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                    {getStatusContent()}
                </div>
                <label className="text-sm font-medium text-slate-700 select-none">
                    {status === 'verified' ? 'You are verified' : "I'm not a robot"}
                </label>
            </div>
            <div className="text-center">
                <RecaptchaIcon className="w-8 h-8 text-slate-500" />
                <p className="text-[10px] text-slate-500 leading-none">reCAPTCHA</p>
                <p className="text-[8px] text-slate-500 leading-none">Privacy - Terms</p>
            </div>
        </div>
    );
};