import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TransferLimits, VerificationLevel, SecuritySettings, TrustedDevice, Transaction, TransactionStatus, PushNotificationSettings, UserProfile, PrivacySettings } from '../types';
import { CheckCircleIcon, PencilIcon, DevicePhoneMobileIcon, FingerprintIcon, LockClosedIcon, UserCircleIcon, NetworkIcon, IdentificationIcon, ComputerDesktopIcon, FaceIdIcon, CertificateIcon, ChartBarIcon, ShieldCheckIcon, TrendingUpIcon, EyeIcon, ExclamationTriangleIcon, CameraIcon, SpinnerIcon, EnvelopeIcon, PhoneIcon } from './Icons';
import { ManageLimitsModal } from './ManageLimitsModal';
import { VerificationCenter } from './VerificationCenter';
import { Setup2FAModal } from './Setup2FAModal';
import { SetupBiometricsModal } from './SetupBiometricsModal';

interface SettingsProps {
  transferLimits: TransferLimits;
  onUpdateLimits: (newLimits: TransferLimits) => void;
  verificationLevel: VerificationLevel;
  onVerificationComplete: (level: VerificationLevel) => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (newSettings: Partial<SecuritySettings>) => void;
  trustedDevices: TrustedDevice[];
  onRevokeDevice: (deviceId: string) => void;
  onChangePassword: () => void;
  transactions: Transaction[];
  pushNotificationSettings: PushNotificationSettings;
  onUpdatePushNotificationSettings: (newSettings: Partial<PushNotificationSettings>) => void;
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (update: Partial<PrivacySettings>) => void;
  userProfile: UserProfile;
  onUpdateProfilePicture: (url: string) => void;
}

const KycFeatureCard: React.FC<{
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  unlocked: boolean;
  requiredLevel: string;
  imageUrl?: string;
}> = ({ icon, title, description, unlocked, requiredLevel, imageUrl }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -100px 0px' }
        );

        const currentCardRef = cardRef.current;

        if (currentCardRef) {
            observer.observe(currentCardRef);
        }

        return () => {
            if (currentCardRef) {
                observer.unobserve(currentCardRef);
            }
        };
    }, []);

    return (
        <div ref={cardRef} className={`group relative p-4 rounded-lg shadow-digital-inset transition-all duration-300 overflow-hidden ${unlocked ? 'bg-slate-200' : 'bg-slate-300/50'}`}>
            {unlocked && imageUrl && (
                <>
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: isVisible ? `url(${imageUrl})` : 'none' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-200 via-slate-200/80 to-slate-200/50"></div>
                </>
            )}
            <div className="relative flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full shadow-digital ${unlocked ? 'bg-slate-200/80' : 'bg-slate-300'}`}>
                    {unlocked ? React.cloneElement(icon, { className: "w-6 h-6 text-primary" }) : React.cloneElement(icon, { className: "w-6 h-6 text-slate-400" })}
                </div>
                <div className="flex-grow">
                    <h4 className={`font-bold ${unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h4>
                    <p className={`text-sm ${unlocked ? 'text-slate-600' : 'text-slate-500'}`}>{description}</p>
                </div>
                {unlocked ? (
                    <div className="flex-shrink-0 flex items-center space-x-1 text-green-600 text-xs font-bold bg-green-100/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Unlocked</span>
                    </div>
                ) : (
                    <div className="flex-shrink-0 text-slate-500 text-xs font-semibold bg-slate-200/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        Requires {requiredLevel}
                    </div>
                )}
            </div>
        </div>
    );
};


const SecurityScore: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference * (1 - score / 100);
    const scoreColor = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="text-slate-300" />
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${scoreColor}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-sm font-medium text-slate-500">Score</span>
            </div>
        </div>
    );
};

const LimitProgress: React.FC<{
    title: string;
    usedAmount: number;
    limitAmount: number;
    usedCount: number;
    limitCount: number;
}> = ({ title, usedAmount, limitAmount, usedCount, limitCount }) => {
    const amountPercentage = Math.min((usedAmount / limitAmount) * 100, 100);
    const countPercentage = Math.min((usedCount / limitCount) * 100, 100);

    const getBarColor = (percentage: number) => {
        if (percentage > 90) return 'bg-red-500';
        if (percentage > 75) return 'bg-yellow-500';
        return 'bg-primary';
    };

    return (
        <div className="py-4 first:pt-0 last:pb-0">
            <h4 className="font-semibold text-slate-700 mb-3">{title}</h4>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Amount Used</span>
                        <span className="font-mono text-slate-800 font-semibold">
                            {usedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / {limitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 shadow-digital-inset">
                        <div className={`${getBarColor(amountPercentage)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${amountPercentage}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Transactions Used</span>
                        <span className="font-mono text-slate-800 font-semibold">
                            {usedCount} / {limitCount}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 shadow-digital-inset">
                        <div className={`${getBarColor(countPercentage)} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${countPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{
    idPrefix: string;
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}> = ({ idPrefix, label, description, enabled, onChange }) => (
    <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
        <div>
            <h4 className="font-semibold text-slate-700">{label}</h4>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
        <label htmlFor={`${idPrefix}-toggle-${label.replace(/\s/g, '-')}`} className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={`${idPrefix}-toggle-${label.replace(/\s/g, '-')}`} className="sr-only peer" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
        </label>
    </div>
);

export const Security: React.FC<SettingsProps> = ({ 
    transferLimits, 
    onUpdateLimits, 
    verificationLevel, 
    onVerificationComplete,
    securitySettings,
    onUpdateSecuritySettings,
    trustedDevices,
    onRevokeDevice,
    onChangePassword,
    transactions,
    pushNotificationSettings,
    onUpdatePushNotificationSettings,
    privacySettings,
    onUpdatePrivacySettings,
    userProfile,
    onUpdateProfilePicture,
}) => {
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const securityScore = useMemo(() => {
    let score = 25; // Base score
    if (securitySettings.mfa.enabled) score += 25;
    if (securitySettings.biometricsEnabled) score += 25;
    
    if (verificationLevel === VerificationLevel.LEVEL_3) {
        score += 25;
    } else if (verificationLevel === VerificationLevel.LEVEL_2) {
        score += 15;
    } else if (verificationLevel === VerificationLevel.LEVEL_1) {
        score += 10;
    }

    return Math.round(score);
  }, [securitySettings, verificationLevel]);

  const getUsageForPeriod = (transactions: Transaction[], days: number) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const relevantTxs = transactions.filter(tx => {
        const txDate = tx.statusTimestamps[TransactionStatus.SUBMITTED];
        return txDate >= cutoff && tx.type === 'debit';
    });

    const totalAmount = relevantTxs.reduce((sum, tx) => sum + tx.sendAmount, 0);
    const totalCount = relevantTxs.length;

    return { amount: totalAmount, count: totalCount };
  };

  const dailyUsage = useMemo(() => getUsageForPeriod(transactions, 1), [transactions]);
  const weeklyUsage = useMemo(() => getUsageForPeriod(transactions, 7), [transactions]);
  const monthlyUsage = useMemo(() => getUsageForPeriod(transactions, 30), [transactions]);

  const handleSaveLimits = (newLimits: TransferLimits) => {
    onUpdateLimits(newLimits);
    setIsLimitsModalOpen(false);
  };
  
  const handleVerificationModalClose = (level: VerificationLevel) => {
    onVerificationComplete(level);
    setIsVerificationModalOpen(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate network delay
        setTimeout(() => {
          onUpdateProfilePicture(reader.result as string);
          setIsUploading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const TrustedDeviceRow: React.FC<{ device: TrustedDevice }> = ({ device }) => {
    const DeviceIcon = device.deviceType === 'desktop' ? ComputerDesktopIcon : DevicePhoneMobileIcon;
    return (
        <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center first:pt-0 last:pb-0">
            <div className="flex items-start space-x-4">
                <DeviceIcon className="w-6 h-6 text-slate-500 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="font-medium text-slate-700 flex items-center">{device.browser} {device.isCurrent && <span className="ml-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Current</span>}</p>
                    <p className="text-sm text-slate-500">{device.location} • Last login: {new Date(device.lastLogin).toLocaleDateString()}</p>
                </div>
            </div>
            {!device.isCurrent && (
                <button onClick={() => onRevokeDevice(device.id)} className="mt-2 sm:mt-0 px-3 py-1.5 text-sm font-medium text-red-600 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                    Revoke
                </button>
            )}
        </div>
    );
  };

  const verificationLevelValue = useMemo(() => Object.values(VerificationLevel).indexOf(verificationLevel), [verificationLevel]);

  const kycFeatures = [
      { 
          icon: <ChartBarIcon />, 
          title: "Access to Crypto Trading", 
          description: "Buy, sell, and hold top cryptocurrencies directly within your iCredit Union account.", 
          requiredLevel: VerificationLevel.LEVEL_2, 
          requiredLevelValue: 2,
          imageUrl: 'https://i.imgur.com/9y8d5r3.jpeg'
      },
      { 
          icon: <ShieldCheckIcon />, 
          title: "Enhanced Fraud Protection Insurance", 
          description: "Advanced insurance coverage for unauthorized transactions on your verified account.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://i.imgur.com/O6L0V2M.jpeg'
      },
      { 
          icon: <TrendingUpIcon />, 
          title: "Access to High-Value Transactions", 
          description: "Eligibility for increased transfer limits and access to specialized investment products.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://i.imgur.com/o7z3jYc.jpeg'
      },
      { 
          icon: <EyeIcon />, 
          title: "Dedicated Account Monitoring", 
          description: "Proactive, specialized monitoring of your account activity by our senior security team.", 
          requiredLevel: VerificationLevel.LEVEL_3, 
          requiredLevelValue: 3,
          imageUrl: 'https://i.imgur.com/mG7g8Q9.jpeg'
      },
  ];

  const securityCheckupItems = [
    {
        icon: LockClosedIcon,
        title: 'Strong Password',
        description: 'A strong, unique password is your first line of defense.',
        isComplete: true, // Assuming password is always set
        statusText: 'Active',
        actionText: 'Change',
        action: onChangePassword
    },
    {
        icon: DevicePhoneMobileIcon,
        title: 'Two-Factor Authentication',
        description: 'Add a second layer of security for logins and sensitive actions.',
        isComplete: securitySettings.mfa.enabled,
        statusText: securitySettings.mfa.enabled ? `Enabled (${securitySettings.mfa.method?.toUpperCase()})` : 'Not Enabled',
        actionText: securitySettings.mfa.enabled ? 'Manage' : 'Enable',
        action: () => setIs2FAModalOpen(true)
    },
    {
        icon: FingerprintIcon,
        title: 'Biometric Login',
        description: 'Enable Face ID or fingerprint for faster, secure access on this device.',
        isComplete: securitySettings.biometricsEnabled,
        statusText: securitySettings.biometricsEnabled ? 'Enabled' : 'Not Set Up',
        actionText: 'Setup',
        action: () => setIsBiometricsModalOpen(true)
    },
    {
        icon: IdentificationIcon,
        title: 'Identity Verification',
        description: 'Complete verification to unlock higher limits and more features.',
        isComplete: verificationLevel !== VerificationLevel.UNVERIFIED,
        statusText: verificationLevel,
        actionText: 'Verify',
        action: () => setIsVerificationModalOpen(true)
    }
  ];
  
  const kycLevels = Object.values(VerificationLevel).slice(1);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <div className="flex items-center space-x-3">
                <CertificateIcon className="w-8 h-8 text-primary"/>
                <h2 className="text-2xl font-bold text-slate-800">Security Center</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">Manage your account security settings and connected services.</p>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Profile Information</h2></div>
            <div className="p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group flex-shrink-0">
                    <img src={userProfile.profilePictureUrl} alt="Profile" className="w-24 h-24 rounded-full shadow-digital object-cover" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Change profile picture"
                    >
                        {isUploading ? <SpinnerIcon className="w-8 h-8"/> : <CameraIcon className="w-8 h-8"/>}
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{userProfile.name}</h3>
                    <p className="text-slate-500">{userProfile.email}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-200 rounded-2xl shadow-digital p-6">
            <div className="md:col-span-1">
                <SecurityScore score={securityScore} />
            </div>
            <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800">Your Security Score is {securityScore > 80 ? 'Excellent' : securityScore > 60 ? 'Good' : 'Fair'}</h3>
                <p className="text-sm text-slate-600 mt-1">Complete the security checkup items to improve your score and better protect your account.</p>
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Security Checkup</h2></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityCheckupItems.map(item => {
                    const statusColor = item.isComplete ? 'text-green-600' : 'text-yellow-600';
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3 flex flex-col">
                            <div className="flex items-start space-x-3">
                                <Icon className={`w-8 h-8 ${statusColor}`} />
                                <div className="flex-grow">
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex-grow"></div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                                <div className={`flex items-center text-sm font-semibold ${statusColor}`}>
                                    {item.isComplete ? <CheckCircleIcon className="w-4 h-4 mr-1"/> : <ExclamationTriangleIcon className="w-4 h-4 mr-1"/>}
                                    <span>{item.statusText}</span>
                                </div>
                                 <button onClick={item.action} className="px-3 py-1.5 text-xs font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                                     {item.actionText}
                                 </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Push Notification Preferences</h2></div>
            <div className="p-6 divide-y divide-slate-300">
                <ToggleSwitch
                    idPrefix="push"
                    label="Transactions"
                    description="Receive alerts for sent, received, and failed transactions."
                    enabled={pushNotificationSettings.transactions}
                    onChange={(val) => onUpdatePushNotificationSettings({ transactions: val })}
                />
                <ToggleSwitch
                    idPrefix="push"
                    label="Security Alerts"
                    description="Get notified about new logins, password changes, and new devices."
                    enabled={pushNotificationSettings.security}
                    onChange={(val) => onUpdatePushNotificationSettings({ security: val })}
                />
                <ToggleSwitch
                    idPrefix="push"
                    label="Promotions & Offers"
                    description="Receive updates on new products, features, and special offers."
                    enabled={pushNotificationSettings.promotions}
                    onChange={(val) => onUpdatePushNotificationSettings({ promotions: val })}
                />
            </div>
        </div>
        
        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Communication Preferences</h2></div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-slate-800 flex items-center mb-2"><EnvelopeIcon className="w-5 h-5 mr-2 text-primary"/> Email Notifications</h4>
                    <div className="space-y-2 divide-y divide-slate-300">
                         <ToggleSwitch
                            idPrefix="email"
                            label="Transactions"
                            description="Receipts & transfer updates."
                            enabled={privacySettings.email.transactions}
                            onChange={val => onUpdatePrivacySettings({ email: {...privacySettings.email, transactions: val} })}
                        />
                         <ToggleSwitch
                            idPrefix="email"
                            label="Security Alerts"
                            description="New logins, password changes."
                            enabled={privacySettings.email.security}
                            onChange={val => onUpdatePrivacySettings({ email: {...privacySettings.email, security: val} })}
                        />
                         <ToggleSwitch
                            idPrefix="email"
                            label="Promotions"
                            description="Offers & new features."
                            enabled={privacySettings.email.promotions}
                            onChange={val => onUpdatePrivacySettings({ email: {...privacySettings.email, promotions: val} })}
                        />
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-slate-800 flex items-center mb-2"><PhoneIcon className="w-5 h-5 mr-2 text-primary"/> SMS Notifications</h4>
                     <div className="space-y-2 divide-y divide-slate-300">
                         <ToggleSwitch
                            idPrefix="sms"
                            label="Transactions"
                            description="Real-time transfer alerts."
                            enabled={privacySettings.sms.transactions}
                            onChange={val => onUpdatePrivacySettings({ sms: {...privacySettings.sms, transactions: val} })}
                        />
                         <ToggleSwitch
                            idPrefix="sms"
                            label="Security Alerts"
                            description="Urgent security notifications."
                            enabled={privacySettings.sms.security}
                            onChange={val => onUpdatePrivacySettings({ sms: {...privacySettings.sms, security: val} })}
                        />
                         <ToggleSwitch
                            idPrefix="sms"
                            label="Promotions"
                            description="Occasional marketing messages."
                            enabled={privacySettings.sms.promotions}
                            onChange={val => onUpdatePrivacySettings({ sms: {...privacySettings.sms, promotions: val} })}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Advanced KYC Features</h2></div>
            <div className="p-6 space-y-4">
                <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                        <span>Verification Progress</span>
                        <span className="font-bold text-primary">{verificationLevel}</span>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-2.5 shadow-digital-inset">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(verificationLevelValue / (Object.values(VerificationLevel).length -1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
                {kycFeatures.map(feature => (
                    <KycFeatureCard 
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        unlocked={verificationLevelValue >= feature.requiredLevelValue}
                        requiredLevel={feature.requiredLevel.split(':')[0]}
                        imageUrl={feature.imageUrl}
                    />
                ))}
            </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300"><h2 className="text-xl font-bold text-slate-800">Trusted Devices & Sessions</h2></div>
          <div className="p-6 divide-y divide-slate-300">
             {trustedDevices.map(device => <TrustedDeviceRow key={device.id} device={device} />)}
          </div>
        </div>

        <div className="bg-slate-200 rounded-2xl shadow-digital">
          <div className="p-6 border-b border-slate-300 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Transfer Limits</h2>
             <button onClick={() => setIsLimitsModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                <PencilIcon className="w-4 h-4" />
                <span>Manage</span>
              </button>
          </div>
          <div className="p-6 divide-y divide-slate-300">
             <LimitProgress 
                title="Daily Limit"
                usedAmount={dailyUsage.amount}
                limitAmount={transferLimits.daily.amount}
                usedCount={dailyUsage.count}
                limitCount={transferLimits.daily.count}
            />
            <LimitProgress 
                title="Weekly Limit"
                usedAmount={weeklyUsage.amount}
                limitAmount={transferLimits.weekly.amount}
                usedCount={weeklyUsage.count}
                limitCount={transferLimits.weekly.count}
            />
            <LimitProgress 
                title="Monthly Limit"
                usedAmount={monthlyUsage.amount}
                limitAmount={transferLimits.monthly.amount}
                usedCount={monthlyUsage.count}
                limitCount={transferLimits.monthly.count}
            />
          </div>
        </div>
      </div>
      {isLimitsModalOpen && (
        <ManageLimitsModal 
          limits={transferLimits}
          onSave={handleSaveLimits}
          onClose={() => setIsLimitsModalOpen(false)}
        />
      )}
      {isVerificationModalOpen && (
        <VerificationCenter 
            currentLevel={verificationLevel}
            onClose={handleVerificationModalClose}
        />
      )}
       {is2FAModalOpen && (
          <Setup2FAModal
            onClose={() => setIs2FAModalOpen(false)}
            settings={securitySettings.mfa}
            onUpdate={(mfaUpdate) => onUpdateSecuritySettings({ mfa: { ...securitySettings.mfa, ...mfaUpdate } })}
          />
      )}
      {isBiometricsModalOpen && (
          <SetupBiometricsModal 
            onClose={() => setIsBiometricsModalOpen(false)}
            onEnable={() => onUpdateSecuritySettings({ biometricsEnabled: true })}
          />
      )}
    </>
  );
};