import React from 'react';
import { AtmLocation } from '../types';
// FIX: Imported the missing ArrowDownTrayIcon.
import { XIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, ArrowDownTrayIcon } from './Icons';

interface StreetViewModalProps {
    atm: AtmLocation;
    onClose: () => void;
    userLocation: { lat: number; lng: number } | null;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d * 0.621371; // convert to miles
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({ atm, onClose, userLocation }) => {
    const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, atm.lat, atm.lng) : null;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${atm.lat},${atm.lng}`;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col m-4 animate-fade-in-up overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-3/5 w-full flex-shrink-0">
                    <img src={atm.streetViewImage} alt={`Street view of ${atm.name}`} className="absolute inset-0 w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                        <h2 className="text-3xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{atm.name}</h2>
                        <p className="text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{atm.address}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors z-20">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        {distance !== null && (
                            <div className="bg-slate-200 p-3 rounded-lg shadow-digital-inset">
                                <p className="text-2xl font-bold text-primary">{distance.toFixed(1)}</p>
                                <p className="text-sm text-slate-600">Miles Away</p>
                            </div>
                        )}
                        <div className="bg-slate-200 p-3 rounded-lg shadow-digital-inset">
                             <p className="text-2xl font-bold text-slate-800">{atm.hours === '24 Hours' ? '24/7' : '...'}</p>
                            <p className="text-sm text-slate-600">Operating Hours</p>
                        </div>
                        <div className="bg-slate-200 p-3 rounded-lg shadow-digital-inset">
                            <p className="text-xl font-bold text-slate-800">{atm.network}</p>
                            <p className="text-sm text-slate-600">Network</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-slate-800 mb-2">Available Services</h3>
                        <div className="flex flex-wrap gap-2">
                            {atm.services.map(service => (
                                <span key={service} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-2">
                                    {service === 'Surcharge-Free' && <CurrencyDollarIcon className="w-4 h-4" />}
                                    {service === '24/7 Access' && <ClockIcon className="w-4 h-4" />}
                                    {service === 'Deposit Taking' && <ArrowDownTrayIcon className="w-4 h-4" />}
                                    <span>{service}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-6 border-t border-slate-200">
                     <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                        <MapPinIcon className="w-5 h-5"/>
                        <span>Get Directions</span>
                    </a>
                </div>
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