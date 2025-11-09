import React, { useState, useEffect } from 'react';
import { RegionalHub } from '../types';
import { REGIONAL_HUBS } from '../constants';
import { ShieldCheckIcon } from './Icons';
import { getBankIcon } from './BankLogo';

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

const StatCard: React.FC<{ value: number; label: string; suffix?: string }> = ({ value, label, suffix }) => {
    const count = useCountUp(value);
    return (
        <div className="bg-slate-700/50 p-4 rounded-xl shadow-digital text-center">
            <p className="text-4xl font-bold text-slate-100">{count.toLocaleString()}{suffix}</p>
            <p className="text-sm font-semibold text-slate-400 mt-1">{label}</p>
        </div>
    );
};

export const GlobalNetwork: React.FC = () => {
    const [selectedHub, setSelectedHub] = useState<RegionalHub>(REGIONAL_HUBS[0]);

    return (
        <div className="space-y-8 text-slate-100">
            <div>
                <h2 className="text-3xl font-bold text-slate-100">Global Banking Network</h2>
                <p className="text-md text-slate-400 mt-1">Our interconnected system ensures fast, secure, and compliant transactions across the world.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard value={195} label="Countries Served" />
                <StatCard value={1200} label="Partner Institutions" suffix="+" />
                <StatCard value={99.98} label="Network Uptime" suffix="%" />
                <StatCard value={25} label="Billion USD Processed Daily" suffix="B+" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 relative h-96 md:h-[500px] bg-slate-800/50 rounded-2xl shadow-digital overflow-hidden">
                    <img src="https://i.imgur.com/rLRXk9r.png" alt="World Map" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

                    {REGIONAL_HUBS.map(hub => (
                        <button
                            key={hub.id}
                            onClick={() => setSelectedHub(hub)}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                            style={{ top: hub.mapPosition.top, left: hub.mapPosition.left }}
                            aria-label={`Select ${hub.name} region`}
                        >
                            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${selectedHub.id === hub.id ? 'bg-primary ring-4 ring-primary/30' : 'bg-slate-400'}`}></div>
                            <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-slate-400/50 animate-ping -z-10"></div>
                            <span className={`absolute top-5 left-1/2 -translate-x-1/2 text-xs font-bold transition-all duration-300 ${selectedHub.id === hub.id ? 'text-primary-300' : 'text-slate-400'}`}>{hub.name}</span>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-1 bg-slate-800/50 rounded-2xl shadow-digital flex flex-col animate-fade-in-up" key={selectedHub.id}>
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-100">{selectedHub.name}</h3>
                        <p className="text-sm font-semibold text-slate-400">Regional Headquarters: {selectedHub.hq}</p>
                    </div>
                    <div className="p-6 flex-grow overflow-y-auto space-y-6">
                        <div>
                            <h4 className="font-bold text-slate-300 mb-2">Key Compliance Standards</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedHub.compliance.map(std => (
                                    <span key={std} className="flex items-center space-x-2 bg-slate-700/50 text-slate-300 text-xs font-semibold px-2 py-1 rounded">
                                        <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                        <span>{std}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-300 mb-2">Key Partner Institutions</h4>
                            <div className="space-y-3">
                                {selectedHub.partners.map(partner => {
                                    const BankLogo = getBankIcon(partner.name);
                                    return (
                                        <div key={partner.name} className="flex items-center space-x-3 p-2 bg-slate-900/40 rounded-lg">
                                            <div className="w-8 h-8 bg-white rounded-md flex-shrink-0 flex items-center justify-center p-1">
                                                <BankLogo className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-sm font-medium">{partner.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};