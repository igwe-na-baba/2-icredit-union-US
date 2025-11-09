


import React, { useState, useMemo } from 'react';
import { Recipient, Country } from '../types';
import { AddRecipientModal } from './AddRecipientModal';
import { ChevronDownIcon, ClipboardDocumentIcon, CheckCircleIcon, BankIcon, CreditCardIcon, WithdrawIcon, PencilIcon, getServiceIcon, TrashIcon, ExclamationTriangleIcon, SearchIcon } from './Icons';
import { getBankIcon } from './BankLogo';
import { getInitials, generateHslColorFromString } from '../utils/ui';

interface DeleteRecipientModalProps {
  onClose: () => void;
  onConfirm: () => void;
  recipient: Recipient;
}

const DeleteRecipientModal: React.FC<DeleteRecipientModalProps> = ({ onClose, onConfirm, recipient }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative animate-fade-in-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 shadow-digital-inset">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Confirm Deletion</h2>
          <p className="text-slate-600 my-4">
            Are you sure you want to permanently delete <strong className="text-slate-700">{recipient.fullName}</strong>?
          </p>
          <p className="text-slate-600 my-4 text-sm">
            This action is final and cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow"
          >
            Delete Recipient
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 shadow-digital active:shadow-digital-inset transition-shadow"
          >
            Cancel
          </button>
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

interface RecipientsProps {
    recipients: Recipient[];
    addRecipient: () => void;
    onUpdateRecipient: (recipientId: string, data: any) => void;
    onDeleteRecipient: (recipientId: string) => void;
}

const DeliveryMethod: React.FC<{ icon: React.ReactNode; label: string; enabled: boolean }> = ({ icon, label, enabled }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${enabled ? 'bg-slate-200 shadow-digital' : 'bg-slate-200 opacity-50'}`}>
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${enabled ? 'bg-green-100 text-green-600' : 'bg-slate-300 text-slate-500'}`}>
            {icon}
        </div>
        <div>
            <p className={`font-semibold text-sm ${enabled ? 'text-slate-700' : 'text-slate-500'}`}>{label}</p>
            <p className={`text-xs ${enabled ? 'text-green-600' : 'text-slate-500'}`}>{enabled ? 'Enabled' : 'Not Available'}</p>
        </div>
    </div>
);

const AccountDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-500">{label}:</span>
            <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-slate-700">{value}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-primary">
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};


const RecipientCard: React.FC<{ recipient: Recipient, onEdit: () => void, onDelete: () => void }> = ({ recipient, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const BankLogoComponent = recipient.recipientType === 'service'
        ? getServiceIcon(recipient.serviceName || '')
        : getBankIcon(recipient.bankName);

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center p-1 shadow-md bg-white">
                             <BankLogoComponent className="w-full h-full object-contain rounded-full" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-slate-800">{recipient.nickname || recipient.fullName}</p>
                            <div className="flex items-center space-x-2">
                                <img src={`https://flagcdn.com/w20/${recipient.country.code.toLowerCase()}.png`} alt={recipient.country.name} className="w-5 rounded-sm" />
                                <p className="text-sm text-slate-500">{recipient.bankName} &bull; {recipient.accountNumber}</p>
                            </div>
                        </div>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-slate-300 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DeliveryMethod icon={<BankIcon className="w-5 h-5"/>} label="Bank Deposit" enabled={recipient.deliveryOptions.bankDeposit} />
                        <DeliveryMethod icon={<CreditCardIcon className="w-5 h-5"/>} label="Card Deposit" enabled={recipient.deliveryOptions.cardDeposit} />
                        <DeliveryMethod icon={<WithdrawIcon className="w-5 h-5"/>} label="Cash Pickup" enabled={recipient.deliveryOptions.cashPickup} />
                    </div>
                    <div className="p-3 bg-slate-200 rounded-lg shadow-digital-inset divide-y divide-slate-300">
                        <AccountDetail label="Full Name" value={recipient.fullName} />
                        <AccountDetail label="Account Number" value={recipient.realDetails.accountNumber} />
                        <AccountDetail label="SWIFT/BIC" value={recipient.realDetails.swiftBic} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button onClick={onDelete} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                           <TrashIcon className="w-4 h-4" /> <span>Delete</span>
                        </button>
                        <button onClick={onEdit} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg">
                            <PencilIcon className="w-4 h-4" /> <span>Edit</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const Recipients: React.FC<RecipientsProps> = ({ recipients, addRecipient, onUpdateRecipient, onDeleteRecipient }) => {
    const [recipientToEdit, setRecipientToEdit] = useState<Recipient | null>(null);
    const [recipientToDelete, setRecipientToDelete] = useState<Recipient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecipients = useMemo(() => {
        if (!searchTerm) return recipients;
        const lowercasedFilter = searchTerm.toLowerCase();
        return recipients.filter(recipient =>
            recipient.fullName.toLowerCase().includes(lowercasedFilter) ||
            (recipient.nickname && recipient.nickname.toLowerCase().includes(lowercasedFilter)) ||
            recipient.bankName.toLowerCase().includes(lowercasedFilter)
        );
    }, [recipients, searchTerm]);


    const handleEdit = (recipient: Recipient) => {
        setRecipientToEdit(recipient);
        addRecipient(); // This will open the modal via App.tsx logic
    };

    const handleConfirmDelete = () => {
        if (recipientToDelete) {
            onDeleteRecipient(recipientToDelete.id);
            setRecipientToDelete(null);
        }
    };
    
    return (
        <>
            {recipientToDelete && <DeleteRecipientModal onClose={() => setRecipientToDelete(null)} onConfirm={handleConfirmDelete} recipient={recipientToDelete} />}
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Recipients</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage your saved contacts for transfers.</p>
                    </div>
                    <button onClick={addRecipient} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg">
                        + Add Recipient
                    </button>
                </div>

                <div className="mt-6 mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, nickname, or bank..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-200 border-0 p-3 pl-10 rounded-lg shadow-digital-inset text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-primary"
                        aria-label="Search recipients"
                    />
                </div>

                <div className="space-y-4">
                    {filteredRecipients.length > 0 ? (
                        filteredRecipients.map(recipient => (
                            <RecipientCard key={recipient.id} recipient={recipient} onEdit={() => handleEdit(recipient)} onDelete={() => setRecipientToDelete(recipient)} />
                        ))
                    ) : (
                        <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                            <p className="font-semibold text-slate-600">No recipients found</p>
                            <p className="text-sm text-slate-500">Try adjusting your search term or add a new recipient.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};