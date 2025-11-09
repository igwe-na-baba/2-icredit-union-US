import React, { useState } from 'react';
import { PayPalIcon, CashAppIcon, ZelleIcon, WesternUnionIcon, MoneyGramIcon, CheckCircleIcon, OnfidoIcon, TwilioIcon, SendGridIcon, ShieldCheckIcon } from './Icons';
import { LinkServiceModal } from './LinkServiceModal';

interface IntegrationsProps {
    linkedServices: Record<string, string>;
    onLinkService: (serviceName: string, identifier: string) => void;
    onUnlinkService: (serviceName: string) => void;
}

const serviceProviders = [
    { name: 'PayPal', icon: PayPalIcon, description: 'Send money globally to any PayPal account.' },
    { name: 'CashApp', icon: CashAppIcon, description: 'Instantly send funds to a $Cashtag.' },
    { name: 'Zelle', icon: ZelleIcon, description: 'Send money directly to U.S. bank accounts.' },
    { name: 'Western Union', icon: WesternUnionIcon, description: 'Send cash for pickup at locations worldwide.' },
    { name: 'MoneyGram', icon: MoneyGramIcon, description: 'Reliable cash pickups and bank deposits.' },
];

const platformPartners = {
    'Security & Compliance': [
        { name: 'Onfido', icon: OnfidoIcon, description: 'Industry-leading identity verification for enhanced security and compliance.', website: 'https://onfido.com' },
    ],
    'Communication APIs': [
        { name: 'Twilio', icon: TwilioIcon, description: 'Powering our secure, real-time SMS alerts and notifications.', website: 'https://twilio.com' },
        { name: 'SendGrid', icon: SendGridIcon, description: 'Ensuring reliable delivery of all our transactional emails.', website: 'https://sendgrid.com' },
    ]
};

export const Integrations: React.FC<IntegrationsProps> = ({ linkedServices, onLinkService, onUnlinkService }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleLinkClick = (serviceName: string) => {
        setSelectedService(serviceName);
        setModalOpen(true);
    };

    const handleLink = (serviceName: string, identifier: string) => {
        onLinkService(serviceName, identifier);
        setModalOpen(false);
    };

    return (
        <>
            {modalOpen && (
                <LinkServiceModal
                    serviceName={selectedService}
                    onClose={() => setModalOpen(false)}
                    onLink={handleLink}
                />
            )}
            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Integrations & Connected Services</h2>
                    <p className="text-sm text-slate-500 mt-1">Connect your favorite payment services to send money directly from iCredit Union®.</p>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Payment Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {serviceProviders.map(service => {
                            const isLinked = linkedServices.hasOwnProperty(service.name);
                            const Icon = service.icon;
                            return (
                                <div key={service.name} className="bg-slate-200 rounded-2xl shadow-digital p-6 flex flex-col transition-shadow hover:shadow-lg">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner mx-auto mb-4">
                                        <Icon className="w-full h-full object-contain" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 text-center">{service.name}</h3>
                                    <p className="text-sm text-slate-600 flex-grow text-center my-3">{service.description}</p>
                                    
                                    {isLinked ? (
                                        <div className="mt-4 text-center">
                                            <div className="inline-flex items-center justify-center space-x-2 text-green-700 font-semibold p-2 bg-green-100 rounded-lg">
                                                <CheckCircleIcon className="w-5 h-5"/>
                                                <span>Connected</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 truncate">as {linkedServices[service.name]}</p>
                                            <div className="mt-3 flex space-x-2">
                                                <button className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">Manage</button>
                                                <button onClick={() => onUnlinkService(service.name)} className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">Unlink</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleLinkClick(service.name)}
                                            className="mt-6 w-full py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            Link Account
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                 <div className="bg-slate-200 rounded-2xl shadow-digital mt-8">
                    <div className="p-6 border-b border-slate-300">
                        <h2 className="text-xl font-bold text-slate-800">Platform Partners</h2>
                        <p className="text-sm text-slate-500 mt-1">Powered by industry-leading technology for security and communication.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {Object.entries(platformPartners).map(([category, partners]) => (
                            <div key={category}>
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2 text-primary"/>{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {partners.map(partner => {
                                        const Icon = partner.icon;
                                        return (
                                            <div key={partner.name} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset flex items-center space-x-4">
                                                <Icon className="w-10 h-10 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{partner.name}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{partner.description}</p>
                                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                                                        Learn More &rarr;
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
