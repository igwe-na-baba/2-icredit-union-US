import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    SearchIcon, 
    XCircleIcon, 
    DepositIcon, 
    ChevronDownIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon,
    TagIcon,
    DocumentCheckIcon,
    SpinnerIcon,
    GlobeAmericasIcon
} from './Icons';
import { getBankIcon } from './BankLogo';
import { DownloadableReceipt } from './DownloadableReceipt';

declare const html2canvas: any;
declare const jspdf: any;

interface ActivityLogProps {
  transactions: Transaction[];
  onUpdateTransactions: (transactionIds: string[], updates: Partial<Transaction>) => void;
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-1 py-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const TransactionRow: React.FC<{ 
    transaction: Transaction; 
    searchTerm: string; 
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDownloadReceipt: (transaction: Transaction) => void;
    isGeneratingPdf: boolean;
}> = ({ transaction, searchTerm, isSelected, onSelect, onDownloadReceipt, isGeneratingPdf }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
    const statusIcon = isCompleted ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClockIcon className="w-5 h-5 text-yellow-400" />;
    const statusColor = isCompleted ? 'text-green-300 bg-green-500/20' : 'text-yellow-300 bg-yellow-500/20';
    
    const isCredit = transaction.type === 'credit';
    const amount = isCredit ? transaction.sendAmount : transaction.sendAmount + transaction.fee;
    
    const getTransactionIcon = () => {
        if (isCredit) {
            return transaction.chequeDetails ? 
                <ClipboardDocumentIcon className="w-6 h-6 text-slate-300" /> : 
                <DepositIcon className="w-6 h-6 text-slate-300" />;
        }
        
        // Debit
        if (transaction.recipient.country.code !== 'US') {
            return <GlobeAmericasIcon className="w-6 h-6 text-slate-300" />;
        }
        
        const BankLogo = getBankIcon(transaction.recipient.bankName);
        return <BankLogo className="w-6 h-6" />;
    };

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the row from toggling when copying
        navigator.clipboard.writeText(transaction.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };
    
    return (
        <>
            <tr
                className={`border-b border-slate-700 last:border-b-0 group transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/20' : 'hover:bg-white/5'
                }`}
                onClick={() => onSelect(transaction.id)}
            >
                <td className="py-4 px-6 w-12 text-center">
                    <input
                        type="checkbox"
                        readOnly
                        checked={isSelected}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-primary focus:ring-primary pointer-events-none"
                    />
                </td>
                <td className="py-4 px-6">
                    <div className="text-sm text-slate-200 font-medium">
                        {transaction.statusTimestamps[TransactionStatus.SUBMITTED].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-slate-400">
                        {transaction.statusTimestamps[TransactionStatus.SUBMITTED].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center font-bold text-slate-300 shadow-inner">
                            {getTransactionIcon()}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-100">
                                <Highlight text={isCredit ? 'Deposit' : transaction.recipient.fullName} highlight={searchTerm} />
                            </p>
                            <p className="text-xs text-slate-400">
                                <Highlight text={isCredit ? transaction.description : `To: ${transaction.recipient.bankName}, ${transaction.recipient.country.code}`} highlight={searchTerm} />
                            </p>
                        </div>
                    </div>
                </td>
                <td className="py-4 px-6 text-sm text-slate-300">
                    <Highlight text={transaction.purpose || 'N/A'} highlight={searchTerm} />
                </td>
                <td className={`py-4 px-6 font-mono text-right ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                    {isCredit ? '+' : '-'} {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center space-x-1 ${statusColor}`}>
                        {statusIcon}
                        <span>{transaction.status}</span>
                    </span>
                </td>
                 <td className="py-4 px-6 text-center">
                    {transaction.reviewed && (
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mx-auto" />
                    )}
                </td>
                <td className="py-4 px-6 text-center" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-black/20 border-b-2 border-slate-700">
                    <td colSpan={8}>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-down">
                            {/* Financial Details */}
                            <div className="space-y-3 text-sm">
                                <h4 className="font-bold text-slate-200 mb-2">Financial Breakdown</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between p-2 rounded bg-slate-700/30"><span className="text-slate-400">Amount Sent:</span> <span className="font-mono text-slate-200">{transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    {!isCredit && <div className="flex justify-between p-2 rounded bg-slate-700/30"><span className="text-slate-400">Fee:</span> <span className="font-mono text-slate-200">{transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>}
                                    <div className="flex justify-between p-2 rounded bg-slate-700/30 font-semibold"><span className="text-slate-400">Total {isCredit ? 'Credited' : 'Debited'}:</span> <span className="font-mono text-slate-200">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
                                    {!isCredit && transaction.exchangeRate !== 1 && (
                                    <>
                                        <div className="flex justify-between p-2 rounded bg-slate-700/30"><span className="text-slate-400">Exchange Rate:</span> <span className="font-mono text-slate-200">1 USD = {transaction.exchangeRate.toFixed(4)} {transaction.receiveCurrency || transaction.recipient.country.currency}</span></div>
                                        <div className="flex justify-between p-2 rounded bg-slate-700/30 font-semibold"><span className="text-slate-400">Recipient Gets:</span> <span className="font-mono text-slate-200">{transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency || transaction.recipient.country.currency })}</span></div>
                                    </>
                                    )}
                                </div>
                                {!isCredit && (
                                    <div className="pt-3 border-t border-slate-700/50">
                                        <h4 className="font-bold text-slate-200 mb-2">Bank Details</h4>
                                        <div className="flex justify-between p-2 rounded bg-slate-700/30"><span className="text-slate-400">Account #:</span> <span className="font-mono text-slate-200">{transaction.recipient.realDetails.accountNumber}</span></div>
                                        <div className="flex justify-between p-2 rounded bg-slate-700/30"><span className="text-slate-400">SWIFT/BIC:</span> <span className="font-mono text-slate-200">{transaction.recipient.realDetails.swiftBic}</span></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Recipient & Notes Details */}
                            <div className="space-y-3 text-sm">
                                <h4 className="font-bold text-slate-200 mb-2">Details</h4>
                                 <div>
                                    <p className="text-slate-400">Description:</p>
                                    <p className="font-semibold text-slate-300">{transaction.description}</p>
                                </div>
                                 <div>
                                    <p className="text-slate-400">Location:</p>
                                    <p className="font-semibold text-slate-300">{transaction.senderLocation || 'N/A'} &rarr; {transaction.recipientLocation || 'N/A'}</p>
                                </div>
                                {!isCredit && transaction.recipient.streetAddress && (
                                    <div>
                                        <p className="text-slate-400">Recipient Address:</p>
                                        <address className="font-semibold text-slate-300 not-italic leading-relaxed">
                                            {transaction.recipient.streetAddress}<br />
                                            {transaction.recipient.city}, {transaction.recipient.stateProvince} {transaction.recipient.postalCode}<br />
                                            {transaction.recipient.country.name}
                                        </address>
                                    </div>
                                )}
                            </div>

                            {/* Actions & Info */}
                            <div className="space-y-3 text-sm">
                                <h4 className="font-bold text-slate-200 mb-2">Info & Actions</h4>
                                <div>
                                    <p className="text-slate-400">Purpose:</p>
                                    <p className="font-semibold text-slate-300">{transaction.purpose || 'N/A'}</p>
                                </div>
                                 <div>
                                    <p className="text-slate-400">Transaction ID:</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-xs text-slate-300 truncate">{transaction.id}</p>
                                        <button onClick={handleCopyId} className="ml-2 p-1 text-slate-400 hover:text-primary rounded-full transition-colors" aria-label="Copy transaction ID">
                                            {copiedId ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownloadReceipt(transaction); }}
                                        disabled={isGeneratingPdf}
                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingPdf ? <SpinnerIcon className="w-4 h-4"/> : <ArrowDownTrayIcon className="w-4 h-4"/>}
                                        <span>{isGeneratingPdf ? 'Generating...' : 'Download Receipt'}</span>
                                    </button>
                                    {!isCredit && (
                                        <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                                            <ArrowPathIcon className="w-4 h-4"/>
                                            <span>Repeat Transaction</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Status History */}
                            <div className="space-y-3 text-sm">
                                <h4 className="font-bold text-slate-200 mb-2">Status History</h4>
                                <div className="relative pl-5 border-l-2 border-slate-700 space-y-4">
                                    {Object.entries(transaction.statusTimestamps)
                                        .filter(([, timestamp]) => timestamp)
                                        .sort(([, a], [, b]) => new Date(a as Date).getTime() - new Date(b as Date).getTime())
                                        .map(([status, timestamp], index, arr) => {
                                            const isLast = index === arr.length - 1;
                                            const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
                                            const isCurrentStep = isLast && !isCompleted;
                                            const isPastStep = index < arr.length - 1 || isCompleted;

                                            return (
                                                <div key={status} className="relative">
                                                    <div className={`absolute -left-[calc(0.5rem+1px)] top-1 w-4 h-4 rounded-full ${
                                                        isCurrentStep ? 'bg-primary ring-2 ring-primary/50 animate-pulse' :
                                                        isPastStep ? 'bg-green-500' :
                                                        'bg-slate-600'
                                                    }`}></div>
                                                    <p className="font-semibold text-slate-300">{status}</p>
                                                    <p className="text-xs text-slate-400">{(timestamp as Date).toLocaleString()}</p>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
            <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 1 + half + 1) pageNumbers.push('...');
            
            let start = Math.max(2, currentPage - half);
            let end = Math.min(totalPages - 1, currentPage + half);

            if (currentPage <= half + 1) {
                end = maxPagesToShow - 1;
            }
            if (currentPage >= totalPages - half) {
                start = totalPages - maxPagesToShow + 2;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - half - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };
    
    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-between px-6 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <div className="hidden sm:flex items-center space-x-1">
                {pageNumbers.map((number, index) =>
                    typeof number === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(number)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-shadow ${
                                currentPage === number
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-slate-800/50 text-slate-300'
                            }`}
                        >
                            {number}
                        </button>
                    ) : (
                        <span key={index} className="px-4 py-2 text-sm font-medium text-slate-400">
                            {number}
                        </span>
                    )
                )}
            </div>
             <p className="sm:hidden text-sm text-slate-400">Page {currentPage} of {totalPages}</p>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </nav>
    );
};


export const ActivityLog: React.FC<ActivityLogProps> = ({ transactions, onUpdateTransactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | 'date' | 'amount'; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessingReview, setIsProcessingReview] = useState(false);
  const [generatingPdfFor, setGeneratingPdfFor] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 8;
  
  const statusOptions = [
      'all', 
      ...Object.values(TransactionStatus)
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  const requestSort = (key: keyof Transaction | 'date' | 'amount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset page on new sort
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions
      .filter(tx => {
        if (statusFilter === 'all') return true;
        return tx.status === statusFilter;
      })
      .filter(tx => {
        const term = debouncedSearchTerm.toLowerCase();
        if (!term) return true;
        const recipientName = tx.type === 'credit' ? 'deposit' : tx.recipient.fullName.toLowerCase();
        return (
          recipientName.includes(term) ||
          tx.description.toLowerCase().includes(term) ||
          tx.recipient.bankName.toLowerCase().includes(term) ||
          (tx.purpose || '').toLowerCase().includes(term)
        );
      });
    
    filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortConfig.key) {
            case 'date':
                aValue = a.statusTimestamps[TransactionStatus.SUBMITTED].getTime();
                bValue = b.statusTimestamps[TransactionStatus.SUBMITTED].getTime();
                break;
            case 'amount':
                aValue = a.sendAmount + (a.type === 'debit' ? a.fee : 0);
                bValue = b.sendAmount + (b.type === 'debit' ? b.fee : 0);
                break;
            default:
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
                break;
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return filtered;
  }, [transactions, debouncedSearchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    return sortedAndFilteredTransactions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedAndFilteredTransactions, currentPage, ITEMS_PER_PAGE]);

    useEffect(() => {
        setSelectedIds(new Set());
    }, [debouncedSearchTerm, statusFilter, currentPage, sortConfig]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allVisibleIds = new Set(paginatedTransactions.map(tx => tx.id));
            setSelectedIds(allVisibleIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleMarkAsReviewed = () => {
        setIsProcessingReview(true);
        setTimeout(() => {
            onUpdateTransactions(Array.from(selectedIds), { reviewed: true });
            setSelectedIds(new Set());
            setIsProcessingReview(false);
        }, 3000);
    };

    const handleCategorize = (purpose: string) => {
        if (!purpose) return;
        onUpdateTransactions(Array.from(selectedIds), { purpose });
        setSelectedIds(new Set());
    };

    const handleDownloadReceipt = (transaction: Transaction) => {
        setGeneratingPdfFor(transaction.id);
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [800, canvas.height * (800 / canvas.width)]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
                    pdf.save(`iCU_Receipt_${transaction.id}.pdf`);
                    setGeneratingPdfFor(null);
                });
            } else {
                console.error('Could not generate PDF. Required elements or libraries are missing.');
                alert('Could not generate PDF at this time.');
                setGeneratingPdfFor(null);
            }
        }, 100);
    };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
        setCurrentPage(1);
    }
  }, [sortedAndFilteredTransactions, totalPages, currentPage]);
  
  const isFiltered = debouncedSearchTerm !== '' || statusFilter !== 'all';

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return <ChevronDownIcon className={`w-4 h-4 inline-block ml-1 transition-transform duration-200 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} />;
  };

  return (
    <>
      <div className="relative bg-slate-900 rounded-2xl shadow-digital overflow-hidden">
        {/* Background Image Layer */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center animate-background-pan"
            style={{
                backgroundImage: "url('https://i.imgur.com/5J3m0p7.jpeg')"
            }}
        ></div>
        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-slate-900/70 backdrop-blur-sm"></div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-slate-100">Transfer History</h2>
            <p className="text-sm text-slate-400 mt-1">Review, search, and filter all your past transactions.</p>
          </div>
          
          <div className="p-6 border-b border-slate-700">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="w-full md:flex-1 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search by recipient, bank, or purpose..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 text-white border-slate-700 rounded-md focus:ring-2 focus:ring-primary-400 p-3 pl-10"
                  aria-label="Search transactions"
                />
              </div>
              <div className="w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as TransactionStatus | 'all')}
                  className="w-full bg-slate-800/50 text-white border-slate-700 rounded-md focus:ring-2 focus:ring-primary-400 p-3"
                  aria-label="Filter by status"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
              {isFiltered && (
                <button 
                    onClick={handleClearFilters}
                    className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors"
                >
                    <XCircleIcon className="w-5 h-5" />
                    <span>Clear</span>
                </button>
              )}
            </div>
          </div>
          
          {selectedIds.size > 0 && (
              <div className="p-4 bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in-down">
                  <span className="text-sm font-semibold text-slate-200">{selectedIds.size} transaction(s) selected</span>
                  <div className="flex flex-wrap items-center gap-2">
                      <button
                          onClick={handleMarkAsReviewed}
                          disabled={isProcessingReview}
                          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-wait"
                      >
                          {isProcessingReview ? (
                              <>
                                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                                  <span>Processing...</span>
                              </>
                          ) : (
                              <>
                                  <DocumentCheckIcon className="w-4 h-4" />
                                  <span>Mark as Reviewed</span>
                              </>
                          )}
                      </button>
                      <div className="flex items-center bg-slate-700/50 rounded-lg">
                          <span className="pl-3 py-1.5 text-slate-200"><TagIcon className="w-4 h-4"/></span>
                          <select
                              onChange={(e) => handleCategorize(e.target.value)}
                              className="bg-transparent text-slate-200 text-sm focus:ring-0 border-0 border-l border-slate-600 pr-8"
                              value=""
                          >
                              <option value="" disabled>Categorize as...</option>
                              {TRANSACTION_CATEGORIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                      </div>
                       <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-sm text-slate-300 hover:text-white">Deselect all</button>
                  </div>
              </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase">
                <tr>
                  <th scope="col" className="py-3 px-6 w-12">
                    <input type="checkbox"
                      checked={paginatedTransactions.length > 0 && paginatedTransactions.every(tx => selectedIds.has(tx.id))}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-primary focus:ring-primary"
                    />
                  </th>
                  <th scope="col" className={`py-3 px-6 cursor-pointer select-none transition-colors hover:text-slate-200 ${sortConfig.key === 'date' ? 'text-slate-100' : ''}`} onClick={() => requestSort('date')}>Date & Time {getSortIcon('date')}</th>
                  <th scope="col" className="py-3 px-6">Details</th>
                  <th scope="col" className={`py-3 px-6 cursor-pointer select-none transition-colors hover:text-slate-200 ${sortConfig.key === 'purpose' ? 'text-slate-100' : ''}`} onClick={() => requestSort('purpose')}>Purpose {getSortIcon('purpose')}</th>
                  <th scope="col" className={`py-3 px-6 text-right cursor-pointer select-none transition-colors hover:text-slate-200 ${sortConfig.key === 'amount' ? 'text-slate-100' : ''}`} onClick={() => requestSort('amount')}>Amount {getSortIcon('amount')}</th>
                  <th scope="col" className={`py-3 px-6 cursor-pointer select-none transition-colors hover:text-slate-200 ${sortConfig.key === 'status' ? 'text-slate-100' : ''}`} onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                  <th scope="col" className="py-3 px-6">Reviewed</th>
                  <th scope="col" className="py-3 px-6"><span className="sr-only">Expand</span></th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} searchTerm={debouncedSearchTerm} isSelected={selectedIds.has(tx.id)} onSelect={handleSelect} onDownloadReceipt={handleDownloadReceipt} isGeneratingPdf={generatingPdfFor === tx.id} />)
                ) : (
                    <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400">
                            <p className="font-semibold">No transactions found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria.</p>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          {generatingPdfFor && (
              <div id={`receipt-${generatingPdfFor}`}>
                  <DownloadableReceipt transaction={transactions.find(tx => tx.id === generatingPdfFor)!} />
              </div>
          )}
      </div>
    </>
  );
};