import React, { useState, useMemo } from 'react';
import { Card, CardTransaction, SPENDING_CATEGORIES, SpendingCategory, VirtualCard } from '../types';
import { ICreditUnionLogo, EyeIcon, EyeSlashIcon, LockClosedIcon, PlusCircleIcon, AppleWalletIcon, VisaIcon, MastercardIcon, ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon, TransportIcon, FoodDrinkIcon, EntertainmentIcon, GlobeAmericasIcon, XIcon, Cog8ToothIcon, PlusIcon } from './Icons';
import { AddFundsModal } from './AddFundsModal';
import { AddCardModal } from './AddCardModal';
import { AdvancedCardControlsModal } from './AdvancedCardControlsModal';
import { CreateVirtualCardModal } from './CreateVirtualCardModal';

interface CardManagementProps {
    cards: Card[];
    virtualCards: VirtualCard[];
    cardTransactions: CardTransaction[];
    onUpdateCardControls: (cardId: string, updatedControls: Partial<Card['controls']>) => void;
    onAddCard: (cardData: Omit<Card, 'id' | 'controls'>) => void;
    accountBalance: number;
    onAddFunds: (amount: number, cardLastFour: string, cardNetwork: 'Visa' | 'Mastercard') => void;
    onCreateVirtualCard: (linkedCardId: string, nickname: string, spendingLimit: number | null) => void;
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Shopping': return <ShoppingBagIcon className="w-5 h-5" />;
        case 'Food & Drink': return <FoodDrinkIcon className="w-5 h-5" />;
        case 'Entertainment': return <EntertainmentIcon className="w-5 h-5" />;
        case 'Transport': return <TransportIcon className="w-5 h-5" />;
        default: return <ShoppingBagIcon className="w-5 h-5" />;
    }
};

const CardTransactionRow: React.FC<{ transaction: CardTransaction }> = ({ transaction }) => {
    const CategoryIcon = getCategoryIcon(transaction.category);
    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center shadow-digital-inset text-slate-600">
                    {CategoryIcon}
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p className="font-semibold text-slate-800 font-mono">
                -{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        </li>
    );
};

const CardVisual: React.FC<{ card: Card | VirtualCard }> = ({ card }) => {
    const isVirtual = 'nickname' in card;
    const cardImage = isVirtual 
        ? 'https://images.pexels.com/photos/18379477/pexels-photo-18379477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' // Virtual card design
        : card.cardType === 'CREDIT' 
        ? 'https://images.pexels.com/photos/18418299/pexels-photo-18418299.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' // Sleek dark card
        : 'https://images.pexels.com/photos/18379469/pexels-photo-18379469.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'; // Sleek light card

    const isFrozen = ('controls' in card && card.controls.isFrozen) || ('isFrozen' in card && card.isFrozen);

    return (
        <div 
            className={`relative w-full max-w-md mx-auto rounded-2xl text-white shadow-lg transition-all duration-500 overflow-hidden ${isFrozen ? 'grayscale' : ''}`}
            style={{ height: '212px' }}
        >
             <div 
                className="absolute inset-0 bg-cover bg-center animate-card-zoom"
                style={{ backgroundImage: `url(${cardImage})` }}
            />
            <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
            <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <ICreditUnionLogo />
                    {'network' in card && (card.network === 'Visa' ? <VisaIcon className="w-16 h-auto" /> : <MastercardIcon className="w-12 h-auto" />)}
                </div>
                <div className="font-mono text-2xl tracking-widest my-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    {isVirtual ? card.fullNumber.replace(/(\d{4})/g, '$1 ').trim() : `•••• •••• •••• ${card.lastFour}`}
                </div>
                <div className="flex justify-between items-end text-sm mt-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    <div>
                        <span className="block text-xs opacity-70">{isVirtual ? 'Virtual Card' : 'Card Holder'}</span>
                        <span className="font-semibold">{isVirtual ? card.nickname : card.cardholderName}</span>
                    </div>
                    <div>
                        <span className="block text-xs opacity-70">Expires</span>
                        <span className="font-semibold">{card.expiryDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddCardPlaceholder: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="relative w-full max-w-md mx-auto p-6 rounded-2xl bg-slate-200 shadow-digital-inset border-2 border-dashed border-slate-400 text-slate-500 flex flex-col items-center justify-center hover:bg-slate-300/50 hover:border-primary transition-colors" style={{ height: '212px' }}>
        <PlusCircleIcon className="w-12 h-12" />
        <span className="mt-2 font-semibold">Add New Card</span>
    </button>
);

const ViewCardDetailsModal: React.FC<{ card: Card | VirtualCard; onClose: () => void }> = ({ card, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Card Details</h3>
            <div className="space-y-3 p-4 bg-slate-200 rounded-lg shadow-digital-inset font-mono text-lg">
                <p><span className="text-sm font-sans text-slate-600">Number:</span> {card.fullNumber}</p>
                <p><span className="text-sm font-sans text-slate-600">Expires:</span> {card.expiryDate}</p>
                <p><span className="text-sm font-sans text-slate-600">CVC:</span> {card.cvc}</p>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 bg-primary text-white font-semibold rounded-lg shadow-md">Close</button>
        </div>
    </div>
);

const CardControls: React.FC<{ card: Card; onUpdate: (id: string, controls: Partial<Card['controls']>) => void; onOpenAdvanced: () => void; }> = ({ card, onUpdate, onOpenAdvanced }) => {
    const ControlToggle: React.FC<{ label: string; icon: React.ReactNode; enabled: boolean; onChange: (val: boolean) => void }> = ({ label, icon, enabled, onChange }) => (
        <div className="flex justify-between items-center p-3 rounded-lg shadow-digital-inset">
            <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${enabled ? 'bg-primary/20 text-primary' : 'bg-slate-300 text-slate-500'}`}>
                    {icon}
                </div>
                <span className="font-semibold text-slate-700">{label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer shadow-digital-inset peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-digital peer-checked:bg-primary"></div>
            </label>
        </div>
    );
    
    return (
        <div className="bg-slate-200 p-6 rounded-2xl shadow-digital">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Card Controls</h3>
            <div className="space-y-3">
                <ControlToggle label="Freeze Card" icon={<LockClosedIcon className="w-5 h-5"/>} enabled={card.controls.isFrozen} onChange={val => onUpdate(card.id, { isFrozen: val })} />
                <ControlToggle label="Online Purchases" icon={<ShoppingBagIcon className="w-5 h-5"/>} enabled={card.controls.onlinePurchases} onChange={val => onUpdate(card.id, { onlinePurchases: val })} />
                <ControlToggle label="International Transactions" icon={<GlobeAmericasIcon className="w-5 h-5"/>} enabled={card.controls.internationalTransactions} onChange={val => onUpdate(card.id, { internationalTransactions: val })} />
            </div>
            <button onClick={onOpenAdvanced} className="w-full mt-4 py-2 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow flex items-center justify-center space-x-2">
                <Cog8ToothIcon className="w-5 h-5" />
                <span>Advanced Controls</span>
            </button>
        </div>
    );
};

const CreditCardDetails: React.FC<{ card: Card }> = ({ card }) => {
    if (card.cardType !== 'CREDIT' || !card.creditDetails) return null;
    const { creditLimit, currentBalance, paymentDueDate } = card.creditDetails;
    const availableCredit = creditLimit - currentBalance;
    const balancePercentage = (currentBalance / creditLimit) * 100;
    
    return (
        <div className="bg-slate-200 p-6 rounded-2xl shadow-digital">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Credit Details</h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">Current Balance</span>
                        <span className="font-mono text-slate-800 font-semibold">{currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <div className="w-full bg-slate-300 rounded-full h-2.5 shadow-digital-inset">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${balancePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Available: {availableCredit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        <span>Limit: {creditLimit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                    <div>
                        <p className="text-sm font-medium text-slate-600">Next Payment Due</p>
                        <p className="font-semibold text-slate-800">{new Date(paymentDueDate).toLocaleDateString()}</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg">Make a Payment</button>
                </div>
            </div>
        </div>
    );
};

const SpendingSummary: React.FC<{ transactions: CardTransaction[] }> = ({ transactions }) => {
    const byCategory = useMemo(() => {
        // FIX: Correctly typed the reduce accumulator to ensure `byCategory` has the correct type. This resolves errors where `Object.entries` and `Object.values` would return `unknown[]`, which is not compatible with type assertions or functions like `Math.max`.
        return transactions.reduce((acc: Record<SpendingCategory, number>, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {} as Record<SpendingCategory, number>);
    }, [transactions]);

    const sortedCategories = useMemo(() => {
        return (Object.entries(byCategory) as [SpendingCategory, number][])
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
    }, [byCategory]);

    const totalSpent = useMemo(() => transactions.reduce((sum, tx) => sum + tx.amount, 0), [transactions]);
    // FIX: The return type of Object.values is not specific enough, so it is cast to number[] to be compatible with Math.max.
    const maxSpent = useMemo(() => Math.max(0, ...Object.values(byCategory) as number[]), [byCategory]);

    return (
        <div className="bg-slate-200 p-6 rounded-2xl shadow-digital">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Spending Summary</h3>
            <p className="text-3xl font-bold text-slate-900 font-mono">{totalSpent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <p className="text-sm text-slate-500">spent this period</p>
            <div className="mt-4 space-y-3">
                {sortedCategories.map(([category, amount]) => (
                    <div key={category}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-slate-700">{category}</span>
                            <span className="text-slate-500">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                        </div>
                        <div className="w-full bg-slate-300 rounded-full h-2 shadow-digital-inset">
                            <div className="bg-primary h-2 rounded-full" style={{ width: maxSpent > 0 ? `${(amount / maxSpent) * 100}%` : '0%' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const CardManagement: React.FC<CardManagementProps> = ({ cards, virtualCards, cardTransactions, onUpdateCardControls, onAddCard, accountBalance, onAddFunds, onCreateVirtualCard }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isAdvancedControlsOpen, setIsAdvancedControlsOpen] = useState(false);
    const [isCreateVirtualCardModalOpen, setIsCreateVirtualCardModalOpen] = useState(false);

    const allCardsAndPlaceholders = [...cards, ...virtualCards, null];
    const selectedCard = allCardsAndPlaceholders[currentCardIndex];
    const isPhysicalCard = selectedCard && 'controls' in selectedCard;

    const handleUpdate = (cardId: string, updatedControls: Partial<Card['controls']>) => {
        onUpdateCardControls(cardId, updatedControls);
        if (isAdvancedControlsOpen) {
            setIsAdvancedControlsOpen(false); // Close modal on save
        }
    };
    
    return (
        <>
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Cards & Apple Pay</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your physical and virtual cards, controls, and spending.</p>
                </div>

                <div className="relative">
                    {selectedCard ? <CardVisual card={selectedCard} /> : <AddCardPlaceholder onClick={() => setIsAddCardModalOpen(true)} />}
                    {allCardsAndPlaceholders.length > 1 && (
                        <>
                           <button onClick={() => setCurrentCardIndex(i => (i - 1 + allCardsAndPlaceholders.length) % allCardsAndPlaceholders.length)} className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-200 text-slate-600 shadow-digital"><ChevronLeftIcon className="w-6 h-6" /></button>
                           <button onClick={() => setCurrentCardIndex(i => (i + 1) % allCardsAndPlaceholders.length)} className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-200 text-slate-600 shadow-digital"><ChevronRightIcon className="w-6 h-6" /></button>
                        </>
                    )}
                </div>
                
                {selectedCard && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                        <button onClick={() => setShowDetails(true)} className="flex flex-col items-center p-3 bg-slate-200 rounded-lg shadow-digital"><EyeIcon className="w-6 h-6 mb-1"/> <span className="text-xs">Show Details</span></button>
                        <button onClick={() => setIsAddFundsModalOpen(true)} className="flex flex-col items-center p-3 bg-slate-200 rounded-lg shadow-digital"><PlusCircleIcon className="w-6 h-6 mb-1"/> <span className="text-xs">Add Funds</span></button>
                        <button className="flex flex-col items-center p-3 bg-slate-200 rounded-lg shadow-digital"><AppleWalletIcon className="w-6 h-6 mb-1"/> <span className="text-xs">Add to Wallet</span></button>
                        {isPhysicalCard && <button onClick={() => setIsAdvancedControlsOpen(true)} className="flex flex-col items-center p-3 bg-slate-200 rounded-lg shadow-digital"><Cog8ToothIcon className="w-6 h-6 mb-1"/> <span className="text-xs">Controls</span></button>}
                        <button onClick={() => setIsCreateVirtualCardModalOpen(true)} className="flex flex-col items-center p-3 bg-slate-200 rounded-lg shadow-digital"><PlusIcon className="w-6 h-6 mb-1"/> <span className="text-xs">New Virtual Card</span></button>
                    </div>
                )}

                {selectedCard && isPhysicalCard && (
                    <CardControls card={selectedCard} onUpdate={onUpdateCardControls} onOpenAdvanced={() => setIsAdvancedControlsOpen(true)} />
                )}

                {selectedCard && 'cardType' in selectedCard && selectedCard.cardType === 'CREDIT' && <CreditCardDetails card={selectedCard} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Recent Transactions</h3>
                        <ul className="divide-y divide-slate-300">
                           {cardTransactions.map(tx => <CardTransactionRow key={tx.id} transaction={tx} />)}
                        </ul>
                    </div>
                    <SpendingSummary transactions={cardTransactions} />
                </div>
            </div>

            {showDetails && selectedCard && <ViewCardDetailsModal card={selectedCard} onClose={() => setShowDetails(false)} />}
            {isAddFundsModalOpen && <AddFundsModal onClose={() => setIsAddFundsModalOpen(false)} onAddFunds={onAddFunds} />}
            {isAddCardModalOpen && <AddCardModal onClose={() => setIsAddCardModalOpen(false)} onAddCard={onAddCard} />}
            {isAdvancedControlsOpen && isPhysicalCard && <AdvancedCardControlsModal card={selectedCard} onClose={() => setIsAdvancedControlsOpen(false)} onSave={(controls) => handleUpdate(selectedCard.id, controls)} />}
            {isCreateVirtualCardModalOpen && isPhysicalCard && <CreateVirtualCardModal linkedCardId={selectedCard.id} onClose={() => setIsCreateVirtualCardModalOpen(false)} onCreateVirtualCard={onCreateVirtualCard} />}
        </>
    );
};