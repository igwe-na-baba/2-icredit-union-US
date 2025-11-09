import React, { useState, useMemo, useEffect } from 'react';
import { AtmLocation, AtmService } from '../types';
import { ATM_LOCATIONS } from '../constants';
import { MapIcon, ListBulletIcon, CrosshairsIcon, SpinnerIcon, MapPinIcon, EyeIcon } from './Icons';
import { StreetViewModal } from './StreetViewModal';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 * 0.621371; // Radius of the earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const NETWORKS: AtmLocation['network'][] = ['iCredit Union®', 'Allpoint', 'Cirrus', 'Visa Plus'];
const SERVICES: AtmService[] = ['24/7 Access', 'Surcharge-Free', 'Deposit Taking'];

export const AtmLocator: React.FC = () => {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [networkFilters, setNetworkFilters] = useState<Set<AtmLocation['network']>>(new Set());
    const [serviceFilters, setServiceFilters] = useState<Set<AtmService>>(new Set());
    const [locations] = useState<AtmLocation[]>(ATM_LOCATIONS);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedAtm, setSelectedAtm] = useState<AtmLocation | null>(null);

    const filteredLocations = useMemo(() => {
        const term = searchTerm.toLowerCase();
        let result = locations.filter(loc =>
            (loc.name.toLowerCase().includes(term) ||
            loc.address.toLowerCase().includes(term) ||
            loc.city.toLowerCase().includes(term) ||
            loc.zip.toLowerCase().includes(term)) &&
            (networkFilters.size === 0 || networkFilters.has(loc.network)) &&
            (serviceFilters.size === 0 || Array.from(serviceFilters).every(sf => loc.services.includes(sf)))
        );

        if (userLocation) {
            result.sort((a, b) => {
                const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
                const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                return distA - distB;
            });
        }
        return result;
    }, [searchTerm, locations, userLocation, networkFilters, serviceFilters]);

    const handleUseLocation = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newUserLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(newUserLocation);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Could not get your location. Please check your browser permissions.");
                setIsLocating(false);
            }
        );
    };

    const handleFilterToggle = <T,>(set: Set<T>, item: T, setter: React.Dispatch<React.SetStateAction<Set<T>>>) => {
        const newSet = new Set(set);
        if (newSet.has(item)) {
            newSet.delete(item);
        } else {
            newSet.add(item);
        }
        setter(newSet);
    };

    const AtmListItem: React.FC<{ loc: AtmLocation }> = ({ loc }) => {
        const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : null;
        return (
            <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-800">{loc.name}</p>
                        <p className="text-sm text-slate-600">{loc.address}</p>
                        <p className="text-xs text-slate-500">{loc.city}, {loc.state} {loc.zip}</p>
                    </div>
                    {distance !== null && (
                         <p className="text-sm font-semibold text-primary">{distance.toFixed(1)} mi</p>
                    )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-300">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-300/50 inline-block px-2 py-1 rounded">
                        {loc.network}
                    </span>
                    <button onClick={() => setSelectedAtm(loc)} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                        <EyeIcon className="w-4 h-4"/>
                        <span>View Details</span>
                    </button>
                </div>
            </div>
        );
    };

    const MapView = () => {
        const center = userLocation || (filteredLocations.length > 0 ? { lat: filteredLocations[0].lat, lng: filteredLocations[0].lng } : { lat: 40.7128, lng: -74.0060 });

        return (
            <div className="w-full h-96 md:h-[500px] bg-slate-300/50 rounded-lg shadow-digital-inset flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://www.openstreetmap.org/assets/map/HD-a73919283e74c7c88b64a317f2e53d53.png')" }}></div>
                {userLocation && (
                    <div className="absolute text-blue-500" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white shadow-lg"></div>
                    </div>
                )}
                {filteredLocations.map(loc => {
                    const dx = (loc.lng - center.lng) * 2000;
                    const dy = (center.lat - loc.lat) * 2000;
                    return (
                        <button key={loc.id} onClick={() => setSelectedAtm(loc)} className="absolute text-red-500" style={{
                            left: `calc(50% + ${dx}px)`,
                            top: `calc(50% + ${dy}px)`,
                            transform: 'translate(-50%, -100%)'
                        }}>
                             <MapPinIcon className="w-8 h-8 drop-shadow-lg"/>
                        </button>
                    )
                })}
            </div>
        );
    };
    
    return (
        <>
            {selectedAtm && <StreetViewModal atm={selectedAtm} onClose={() => setSelectedAtm(null)} userLocation={userLocation} />}
            <div className="space-y-8 max-w-6xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">ATM & Branch Locator</h2>
                    <p className="text-sm text-slate-500 mt-1">Find iCredit Union® and partner ATMs near you or anywhere in the world.</p>
                </div>
                
                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by city, ZIP, or address"
                            className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset"
                        />
                        <button onClick={handleUseLocation} disabled={isLocating} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 rounded-md shadow-digital text-slate-700 font-semibold md:w-auto">
                            {isLocating ? <SpinnerIcon className="w-5 h-5"/> : <CrosshairsIcon className="w-5 h-5"/>}
                            <span>Use My Location</span>
                        </button>
                    </div>

                    <details className="mb-6">
                        <summary className="font-semibold text-slate-700 cursor-pointer">Filters</summary>
                        <div className="mt-4 p-4 bg-slate-200 rounded-lg shadow-digital-inset">
                            <h4 className="font-bold text-slate-800 mb-2">Networks</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {NETWORKS.map(net => <button key={net} onClick={() => handleFilterToggle(networkFilters, net, setNetworkFilters)} className={`px-3 py-1.5 text-sm font-semibold rounded-full ${networkFilters.has(net) ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'}`}>{net}</button>)}
                            </div>
                             <h4 className="font-bold text-slate-800 mb-2">Services</h4>
                            <div className="flex flex-wrap gap-2">
                                {SERVICES.map(srv => <button key={srv} onClick={() => handleFilterToggle(serviceFilters, srv, setServiceFilters)} className={`px-3 py-1.5 text-sm font-semibold rounded-full ${serviceFilters.has(srv) ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'}`}>{srv}</button>)}
                            </div>
                        </div>
                    </details>
                    
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-600">{filteredLocations.length} locations found</p>
                        <div className="flex items-center gap-2 p-1 bg-slate-300/50 rounded-md shadow-inner">
                            <button onClick={() => setViewMode('map')} className={`px-3 py-2 rounded ${viewMode === 'map' ? 'bg-white shadow' : ''}`}><MapIcon className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}><ListBulletIcon className="w-5 h-5"/></button>
                        </div>
                    </div>

                    {viewMode === 'map' ? <MapView /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                            {filteredLocations.map(loc => <AtmListItem key={loc.id} loc={loc} />)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};