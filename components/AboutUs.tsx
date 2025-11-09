import React from 'react';
import { STAFF_PROFILES } from '../constants';
import { ShieldCheckIcon, SparklesIcon, UsersIcon } from './Icons';

export const AboutUs: React.FC = () => {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">About iCredit Union®</h1>
                <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
                    Powering global finance with trust, transparency, and technology. We're dedicated to building a seamless and secure financial future for everyone, everywhere.
                </p>
            </header>

            <section>
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Our Core Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-200 p-6 rounded-2xl shadow-digital text-center">
                        <ShieldCheckIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Uncompromising Security</h3>
                        <p className="text-sm text-slate-600 mt-2">Your safety is our top priority. We employ state-of-the-art security measures to protect your data and assets at every step.</p>
                    </div>
                    <div className="bg-slate-200 p-6 rounded-2xl shadow-digital text-center">
                        <SparklesIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Relentless Innovation</h3>
                        <p className="text-sm text-slate-600 mt-2">We are constantly pushing the boundaries of what's possible in fintech to deliver a faster, smarter, and more intuitive banking experience.</p>
                    </div>
                    <div className="bg-slate-200 p-6 rounded-2xl shadow-digital text-center">
                        <UsersIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Customer-Centricity</h3>
                        <p className="text-sm text-slate-600 mt-2">You are at the heart of everything we do. We are committed to providing exceptional support and building products that truly meet your needs.</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Our Leadership</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STAFF_PROFILES.map(staff => (
                        <div key={staff.id} className="text-center bg-slate-200 p-6 rounded-2xl shadow-digital">
                            <img src={staff.photoUrl} alt={staff.name} className="w-32 h-32 rounded-full mx-auto shadow-lg mb-4 object-cover" />
                            <h4 className="font-bold text-lg text-slate-800">{staff.name}</h4>
                            <p className="font-semibold text-primary">{staff.role}</p>
                            <p className="text-sm text-slate-600 mt-2">{staff.bio}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};