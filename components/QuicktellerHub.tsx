import React from 'react';
import { View } from '../types';
import { ArrowsRightLeftIcon, QrCodeIcon, CameraIcon, MapPinIcon, BuildingOfficeIcon, HeartIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuicktellerHubProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
}

const ActionButton: React.FC<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    bgImage: string;
}> = ({ title, icon, onClick, bgImage }) => {
    return (
        <button
            onClick={onClick}
            className="group relative h-32 rounded-2xl text-white overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary"
            aria-label={title}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-colors group-hover:bg-black/60"></div>
            <div className="relative h-full flex flex-col items-center justify-center p-2 z-20 text-center">
                <div className="mb-2 opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    {icon}
                </div>
                <h4 className="font-bold text-sm" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{title}</h4>
            </div>
        </button>
    );
};


export const QuicktellerHub: React.FC<QuicktellerHubProps> = ({ setActiveView, onOpenSendMoneyFlow }) => {
    const { t } = useLanguage();

    const actions = [
        {
            title: t('quick_actions_send_money'),
            icon: <ArrowsRightLeftIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => onOpenSendMoneyFlow('send'),
            bgImage: 'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
            title: 'Wire Transfer',
            icon: <BuildingOfficeIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => setActiveView('wire'),
            bgImage: 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
            title: t('quick_actions_scan_to_pay'),
            icon: <QrCodeIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => setActiveView('qrScanner'),
            bgImage: 'https://images.pexels.com/photos/5948773/pexels-photo-5948773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
            title: t('quick_actions_deposit_check'),
            icon: <CameraIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => onOpenSendMoneyFlow('deposit'),
            bgImage: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
            title: t('quick_actions_find_atm'),
            icon: <MapPinIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => setActiveView('atmLocator'),
            bgImage: 'https://images.pexels.com/photos/7563684/pexels-photo-7563684.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        {
            title: 'Donate',
            icon: <HeartIcon className="w-7 h-7 text-white drop-shadow-lg" />,
            onClick: () => setActiveView('causes'),
            bgImage: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
    ];

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 shadow-digital">
            <h3 className="text-2xl font-bold text-slate-100 mb-4">{t('dashboard_quick_actions')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {actions.map(action => (
                    <ActionButton
                        key={action.title}
                        title={action.title}
                        icon={action.icon}
                        onClick={action.onClick}
                        bgImage={action.bgImage}
                    />
                ))}
            </div>
        </div>
    );
};
