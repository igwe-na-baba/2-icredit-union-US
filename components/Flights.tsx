import React, { useState, useMemo, useEffect } from 'react';
import { Flight, FlightBooking, Airport, Account, View } from '../types';
import { AIRPORTS, USER_PIN } from '../constants';
import { AirplaneTicketIcon, ArrowRightIcon, UsersIcon, CalendarDaysIcon, SpinnerIcon, ShieldCheckIcon, QuestionMarkCircleIcon, InfoIcon, XIcon, SearchIcon } from './Icons';

interface FlightsProps {
    bookings: FlightBooking[];
    onBookFlight: (booking: Omit<FlightBooking, 'id' | 'bookingDate' | 'status'>, sourceAccountId: string) => boolean;
    accounts: Account[];
    setActiveView: (view: View) => void;
}

const AirportSelectorModal: React.FC<{ airports: Airport[]; onSelect: (airport: Airport) => void; onClose: () => void; }> = ({ airports, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredAirports = useMemo(() =>
        airports.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase())
        ), [airports, searchTerm]
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-100 rounded-2xl w-full max-w-lg h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search airport, city, or code"
                            className="w-full p-3 pl-10 rounded-md shadow-inner"
                            autoFocus
                        />
                    </div>
                </div>
                <ul className="flex-1 overflow-y-auto">
                    {filteredAirports.map(airport => (
                        <li key={airport.code}>
                            <button onClick={() => onSelect(airport)} className="w-full flex items-center space-x-4 p-4 hover:bg-slate-200 text-left">
                                <img src={airport.imageUrl} alt={airport.name} className="w-20 h-12 object-cover rounded-md flex-shrink-0" loading="lazy" />
                                <div>
                                    <p className="font-semibold text-slate-800">{airport.city} ({airport.code})</p>
                                    <p className="text-sm text-slate-500">{airport.name}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const FlightDetailsModal: React.FC<{ flight: Flight; onClose: () => void; onBook: () => void; }> = ({ flight, onClose, onBook }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 rounded-2xl w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Flight Details</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="col-span-2 relative h-32 rounded-lg overflow-hidden">
                             <img src={flight.from.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={flight.from.name} />
                             <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end text-white">
                                <p className="text-3xl font-bold">{flight.from.code}</p>
                                <p className="text-sm font-semibold">{flight.from.city}</p>
                             </div>
                        </div>
                        <div className="col-span-1 text-center text-slate-500"><AirplaneTicketIcon className="w-8 h-8 mx-auto" /></div>
                        <div className="col-span-2 relative h-32 rounded-lg overflow-hidden">
                             <img src={flight.to.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={flight.to.name} />
                             <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end text-white text-right">
                                <p className="text-3xl font-bold">{flight.to.code}</p>
                                <p className="text-sm font-semibold">{flight.to.city}</p>
                             </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-200 rounded-lg shadow-inner grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-slate-500">Airline</p><p className="font-semibold text-slate-800">{flight.airline} {flight.flightNumber}</p></div>
                        <div><p className="text-slate-500">Aircraft</p><p className="font-semibold text-slate-800">{flight.aircraft || 'N/A'}</p></div>
                        <div><p className="text-slate-500">Departure</p><p className="font-semibold text-slate-800">{flight.departureTime.toLocaleString()}</p></div>
                        <div><p className="text-slate-500">Arrival</p><p className="font-semibold text-slate-800">{flight.arrivalTime.toLocaleString()}</p></div>
                        <div><p className="text-slate-500">Terminal</p><p className="font-semibold text-slate-800">{flight.terminal || 'N/A'}</p></div>
                        <div><p className="text-slate-500">Duration</p><p className="font-semibold text-slate-800">{flight.duration}</p></div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-between items-center">
                    <div>
                        <p className="text-sm text-slate-500">Price / person</p>
                        <p className="text-2xl font-bold text-primary">{flight.price.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</p>
                    </div>
                    <button onClick={onBook} className="px-6 py-3 font-bold text-white bg-primary rounded-lg shadow-md">Book Now</button>
                </div>
            </div>
        </div>
    );
};

// Other components remain the same, so I'll put them inside Flights
const FlightCard: React.FC<{ flight: Flight, onSelect: () => void }> = ({ flight, onSelect }) => (
    <div className="bg-slate-200 rounded-2xl shadow-digital-inset overflow-hidden">
        <div className="p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                    <img src={flight.airlineLogo} alt={flight.airline} className="w-8 h-8 rounded-full bg-white p-1 shadow-sm" />
                    <span className="font-semibold text-slate-700">{flight.airline}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-300/50 px-2 py-1 rounded-full">{flight.stops > 0 ? `${flight.stops} Stop(s)` : 'Non-stop'}</span>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-2xl font-bold text-slate-800">{flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-semibold text-slate-500">{flight.from.code}</p>
                </div>
                <div className="flex-1 text-center px-4">
                    <p className="text-xs text-slate-500">{flight.duration}</p>
                    <div className="w-full h-px bg-slate-300 relative my-1">
                        <AirplaneTicketIcon className="w-5 h-5 text-slate-400 bg-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs text-slate-500">{flight.flightNumber}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-semibold text-slate-500">{flight.to.code}</p>
                </div>
            </div>
        </div>
        <div className="bg-slate-300/50 p-3 flex justify-between items-center">
             <p className="text-sm text-slate-600">Price from <span className="font-bold text-xl text-primary">{flight.price.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span></p>
             <button onClick={onSelect} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md">View Details</button>
        </div>
    </div>
);

// BookingConfirmationModal would also be here

export const Flights: React.FC<FlightsProps> = ({ bookings, onBookFlight, accounts, setActiveView }) => {
    const [fromAirport, setFromAirport] = useState<Airport>(AIRPORTS[0]);
    const [toAirport, setToAirport] = useState<Airport>(AIRPORTS[1]);
    const [departDate, setDepartDate] = useState(new Date().toISOString().split('T')[0]);
    const [passengers, setPassengers] = useState(1);

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Flight[]>([]);
    
    const [isAirportSelectorOpen, setIsAirportSelectorOpen] = useState(false);
    const [airportSelectorTarget, setAirportSelectorTarget] = useState<'from' | 'to' | null>(null);
    
    const [viewingFlight, setViewingFlight] = useState<Flight | null>(null);
    const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
    // ... booking state ...

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setSearchResults([]);
        setTimeout(() => {
            const results: Flight[] = Array.from({ length: 5 }).map((_, i) => ({
                id: `fl_${Date.now()}_${i}`,
                airline: ['Delta', 'British Airways', 'American', 'United', 'JetBlue'][i],
                airlineLogo: `https://logo.clearbit.com/${['delta.com', 'ba.com', 'aa.com', 'united.com', 'jetblue.com'][i]}`,
                flightNumber: `ICU${300 + i}`,
                from: fromAirport, to: toAirport,
                departureTime: new Date(`${departDate}T${String(6 + i * 2).padStart(2, '0')}:${String(Math.floor(Math.random()*60)).padStart(2, '0')}`),
                arrivalTime: new Date(`${departDate}T${String(15 + i * 2).padStart(2, '0')}:${String(Math.floor(Math.random()*60)).padStart(2, '0')}`),
                duration: `${Math.floor(Math.random()*2)+7}h ${Math.floor(Math.random()*60)}m`,
                price: 800 + Math.floor(Math.random()*400),
                stops: Math.random() > 0.7 ? 1 : 0,
                terminal: `T${Math.floor(Math.random() * 5) + 1}`,
                aircraft: ['Boeing 787', 'Airbus A350', 'Boeing 777'][i % 3],
            }));
            setSearchResults(results);
            setIsSearching(false);
        }, 1500);
    };

    const handleBook = (sourceAccountId: string) => {
        if (bookingFlight) {
            const success = onBookFlight({ flight: bookingFlight, passengers, totalPrice: bookingFlight.price * passengers }, sourceAccountId);
            if(success) {
                setBookingFlight(null);
                // Maybe show a success message then navigate
                setActiveView('history');
            }
            return success;
        }
        return false;
    };
    
    return (
        <>
            {isAirportSelectorOpen && (
                <AirportSelectorModal
                    airports={AIRPORTS}
                    onClose={() => setIsAirportSelectorOpen(false)}
                    onSelect={airport => {
                        if (airportSelectorTarget === 'from') setFromAirport(airport);
                        if (airportSelectorTarget === 'to') setToAirport(airport);
                        setIsAirportSelectorOpen(false);
                    }}
                />
            )}
            {viewingFlight && (
                <FlightDetailsModal 
                    flight={viewingFlight} 
                    onClose={() => setViewingFlight(null)}
                    onBook={() => {
                        setBookingFlight(viewingFlight);
                        setViewingFlight(null);
                    }}
                />
            )}
            {/* ... other modals ... */}

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Book Flights</h2>
                    <p className="text-sm text-slate-500 mt-1">Search and book flights using your iCredit Union® account.</p>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">From</label>
                                <button type="button" onClick={() => { setIsAirportSelectorOpen(true); setAirportSelectorTarget('from'); }} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset text-left font-semibold">{fromAirport.city} ({fromAirport.code})</button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">To</label>
                                <button type="button" onClick={() => { setIsAirportSelectorOpen(true); setAirportSelectorTarget('to'); }} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset text-left font-semibold">{toAirport.city} ({toAirport.code})</button>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Depart</label>
                                <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Passengers</label>
                                <input type="number" value={passengers} onChange={e => setPassengers(parseInt(e.target.value))} min="1" className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                            </div>
                        </div>
                        <button type="submit" disabled={isSearching} className="md:col-span-1 w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-md flex items-center justify-center">
                            {isSearching ? <SpinnerIcon className="w-5 h-5"/> : 'Search'}
                        </button>
                    </form>
                </div>
                
                <div className="space-y-4">
                    {isSearching && <div className="text-center p-8"><SpinnerIcon className="w-10 h-10 text-primary mx-auto" /><p className="mt-4 font-semibold text-slate-600">Finding flights...</p></div>}
                    {!isSearching && searchResults.length > 0 && searchResults.map(flight => <FlightCard key={flight.id} flight={flight} onSelect={() => setViewingFlight(flight)} />)}
                </div>
            </div>
        </>
    );
};