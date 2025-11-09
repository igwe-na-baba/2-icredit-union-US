import React, { useState, useEffect, useRef } from 'react';
import { SpinnerIcon, DevicePhoneMobileIcon, CheckCircleIcon, KeypadIcon, XIcon, ShieldCheckIcon } from './Icons';
import { SecuritySettings } from '../types';
import { sendSmsNotification, generateOtpSms } from '../services/notificationService';

interface Setup2FAModalProps {
    onClose: () => void;
    settings: SecuritySettings['mfa'];
    onUpdate: (update: Partial<SecuritySettings['mfa']>) => void;
}

type Step = 'manage' | 'setup_sms' | 'verify_sms' | 'setup_app' | 'success';

const OtpInput: React.FC<{ length: number; onChange: (otp: string) => void; hasError: boolean }> = ({ length, onChange, hasError }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if(hasError) {
            setOtp(new Array(length).fill(""));
            inputRefs.current[0]?.focus();
        }
    }, [hasError, length]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        onChange(newOtp.join(""));

        if (element.value !== "" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if(paste) {
            const newOtp = paste.split('');
            setOtp(newOtp);
            onChange(paste);
            if(inputRefs.current[paste.length - 1]) {
                inputRefs.current[paste.length - 1]?.focus();
            }
        }
    }

    return (
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength={1}
                    value={data}
                    onChange={e => handleChange(e.target as HTMLInputElement, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onFocus={e => e.target.select()}
                    ref={el => { inputRefs.current[index] = el; }}
                    className={`w-12 h-14 text-center text-2xl font-bold bg-slate-200 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary ${hasError ? 'ring-2 ring-red-500' : ''}`}
                />
            ))}
        </div>
    );
};


export const Setup2FAModal: React.FC<Setup2FAModalProps> = ({ onClose, settings, onUpdate }) => {
    const [step, setStep] = useState<Step>('manage');
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const phone = '+1 (***) ***-1234'; // Masked phone number for display

    useEffect(() => {
        let timer: number;
        if (resendCooldown > 0) {
            timer = window.setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);
    
    const sendCode = () => {
        sendSmsNotification(phone, generateOtpSms());
        setResendCooldown(30);
    }

    const handleEnableSms = () => {
        setIsProcessing(true);
        sendCode();
        setTimeout(() => {
            setIsProcessing(false);
            setStep('verify_sms');
        }, 1000);
    };

    const handleVerifySms = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if(otp.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            if (otp === '123456') { // Demo check
                onUpdate({ enabled: true, method: 'sms' });
                setIsProcessing(false);
                setStep('success');
            } else {
                setError('The code you entered is incorrect. Please try again.');
                setIsProcessing(false);
            }
        }, 1000);
    };

    const handleDisable = () => {
        onUpdate({ enabled: false, method: null });
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'manage':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Select your preferred method for Two-Factor Authentication. This adds an extra layer of security to your account.</p>
                        
                        <button onClick={() => setStep('setup_sms')} className={`w-full text-left p-4 rounded-lg transition-all ${settings.method === 'sms' ? 'shadow-digital-inset' : 'shadow-digital active:shadow-digital-inset'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <DevicePhoneMobileIcon className="w-6 h-6 text-primary"/>
                                    <span className="font-semibold text-slate-800">SMS Verification</span>
                                </div>
                                {settings.method === 'sms' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                            </div>
                        </button>
                        
                        <button onClick={() => setStep('setup_app')} className={`w-full text-left p-4 rounded-lg transition-all ${settings.method === 'app' ? 'shadow-digital-inset' : 'shadow-digital active:shadow-digital-inset'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <KeypadIcon className="w-6 h-6 text-primary"/>
                                    <span className="font-semibold text-slate-800">Authenticator App</span>
                                </div>
                                {settings.method === 'app' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                            </div>
                        </button>

                        {settings.enabled && (
                             <button onClick={handleDisable} className="w-full mt-6 py-2 text-red-600 font-semibold">
                                Disable Two-Factor Authentication
                            </button>
                        )}
                    </div>
                );
            case 'setup_sms':
                return (
                    <div>
                        <button onClick={() => setStep('manage')} className="text-sm font-semibold text-primary mb-4">&larr; Back to methods</button>
                        <p className="text-sm text-slate-600 mb-4">A 6-digit verification code will be sent to your registered mobile number ending in <strong>****1234</strong>. Message and data rates may apply.</p>
                        <button onClick={handleEnableSms} disabled={isProcessing} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Send Verification Code'}
                        </button>
                    </div>
                );
            case 'verify_sms':
                return (
                    <form onSubmit={handleVerifySms}>
                        <button onClick={() => setStep('setup_sms')} className="text-sm font-semibold text-primary mb-4">&larr; Back</button>
                        <p className="text-sm text-slate-600 mb-4">Enter the 6-digit code we sent to your phone.</p>
                        <OtpInput length={6} onChange={setOtp} hasError={!!error} />
                        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                        
                        <div className="text-center mt-4">
                            {resendCooldown > 0 ? (
                                <p className="text-sm text-slate-500">Resend code in {resendCooldown}s</p>
                            ) : (
                                <button type="button" onClick={sendCode} className="text-sm font-semibold text-primary hover:underline">
                                    Resend Code
                                </button>
                            )}
                        </div>

                        <button type="submit" disabled={isProcessing} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center disabled:opacity-50">
                             {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Verify & Enable'}
                        </button>
                    </form>
                );
            case 'setup_app':
                return (
                     <div>
                        <button onClick={() => setStep('manage')} className="text-sm font-semibold text-primary mb-4">&larr; Back to methods</button>
                        <p className="text-sm text-slate-600 mb-4">1. Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                        <div className="p-4 bg-white rounded-lg shadow-digital-inset w-40 h-40 mx-auto flex items-center justify-center">
                             <p className="text-xs text-slate-500">(Simulated QR Code)</p>
                        </div>
                        <p className="text-sm text-slate-600 my-4">2. Enter the 6-digit code from your app to verify.</p>
                        <button onClick={() => { onUpdate({ enabled: true, method: 'app' }); setStep('success'); }} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Verify & Enable (Demo)</button>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">2FA Enabled!</h3>
                        <p className="text-slate-600 mt-2">Your account is now more secure with SMS verification.</p>
                        <button onClick={onClose} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        {step === 'success' ? <CheckCircleIcon className="w-8 h-8 text-green-500"/> : <ShieldCheckIcon className="w-8 h-8 text-primary"/>}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Two-Factor Authentication</h2>
                </div>
                {renderContent()}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full">
                    <XIcon className="w-6 h-6"/>
                </button>
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