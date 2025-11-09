import React, { useState, useEffect } from 'react';
import { CharitableCause, Account, Donation } from '../types';
import { CHARITABLE_CAUSES } from '../constants';
import { HeartIcon, ChildIcon, HomeModernIcon } from './Icons';
import { DonationModal } from './DonationModal';

interface GlobalCausesProps {
    accounts: Account[];
    handleMakeDonation: (donation: Donation) => boolean;
}

const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentCount = Math.floor(start + (end - start) * progress);
            setCount(currentCount);
            if (progress === 1) {
                clearInterval(timer);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [end, duration]);
    return count;
};

const ImpactStat: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const count = useCountUp(value);
    return (
        <div className="text-center">
            <p className="text-4xl font-bold text-primary">{count.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
        </div>
    );
};

const CauseCard: React.FC<{ cause: CharitableCause; onDonate: () => void }> = ({ cause, onDonate }) => {
    const getIcon = () => {
        if (cause.id.includes('orphanage')) return <ChildIcon className="w-8 h-8 text-primary" />;
        if (cause.id.includes('maternal')) return <HeartIcon className="w-8 h-8 text-primary" />;
        if (cause.id.includes('homeless')) return <HomeModernIcon className="w-8 h-8 text-primary" />;
        return <HeartIcon className="w-8 h-8 text-primary" />;
    };

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital flex flex-col overflow-hidden">
            <img src={cause.imageUrl} alt={cause.title} className="w-full h-48 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start space-x-4 mb-3">
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center shadow-digital">
                        {getIcon()}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">{cause.organization}</p>
                        <h3 className="text-xl font-bold text-slate-800">{cause.title}</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-600 flex-grow">{cause.description}</p>
                <p className="text-sm font-semibold text-slate-700 mt-4 bg-slate-200 shadow-digital-inset p-3 rounded-lg">"{cause.impactStatement}"</p>
                <button onClick={onDonate} className="w-full mt-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg">
                    Donate Now
                </button>
            </div>
        </div>
    );
};

export const GlobalCauses: React.FC<GlobalCausesProps> = ({ accounts, handleMakeDonation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCause, setSelectedCause] = useState<CharitableCause | null>(null);

    const handleDonateClick = (cause: CharitableCause) => {
        setSelectedCause(cause);
        setIsModalOpen(true);
    };

    return (
        <>
            {isModalOpen && selectedCause && (
                <DonationModal
                    cause={selectedCause}
                    accounts={accounts}
                    onClose={() => setIsModalOpen(false)}
                    onDonate={handleMakeDonation}
                />
            )}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Global Causes</h2>
                    <p className="text-sm text-slate-500 mt-1">Join us in making a difference. Support initiatives powered by our partnership with the World Health Organization.</p>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <h3 className="text-xl font-bold text-slate-800 text-center mb-4">Our Collective Impact</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <ImpactStat value={125678} label="Meals Provided" />
                        <ImpactStat value={45231} label="Children Sheltered" />
                        <ImpactStat value={8921} label="Mothers Supported" />
                        <ImpactStat value={2345678} label="Total Donated (USD)" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CHARITABLE_CAUSES.map(cause => (
                        <CauseCard key={cause.id} cause={cause} onDonate={() => handleDonateClick(cause)} />
                    ))}
                </div>
            </div>
        </>
    );
};