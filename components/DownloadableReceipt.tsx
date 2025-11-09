import React from 'react';
import { Transaction, TransactionStatus, Account } from '../types';
import { ICreditUnionLogo } from './Icons';
import { USER_PROFILE } from '../constants';

interface DownloadableReceiptProps {
  transaction: Transaction;
  sourceAccount: Account;
}

export const DownloadableReceipt: React.FC<DownloadableReceiptProps> = ({ transaction, sourceAccount }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED || transaction.status === TransactionStatus.CLEARED;
    const isCredit = transaction.type === 'credit';

    return (
        <div className="relative w-[800px] bg-white text-gray-800 p-10 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                <div className="flex items-center space-x-3">
                    <ICreditUnionLogo />
                    <h1 className="text-3xl font-bold text-gray-900">iCredit Union®</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold">Transaction Receipt</h2>
                    <p className="text-sm text-gray-500 font-mono">{transaction.id}</p>
                </div>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                 <div>
                    <p className="text-gray-500">Date Issued</p>
                    <p className="font-semibold">{transaction.statusTimestamps.Submitted.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                 <div className="text-right">
                    <p className="text-gray-500">Status</p>
                    <p className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>{transaction.status}</p>
                </div>
                {transaction.wireReferenceNumber && (
                    <div>
                        <p className="text-gray-500">Wire Reference #</p>
                        <p className="font-semibold font-mono">{transaction.wireReferenceNumber}</p>
                    </div>
                )}
                 {transaction.taxId && (
                     <div className="text-right">
                        <p className="text-gray-500">Compliance ID</p>
                        <p className="font-semibold font-mono">{transaction.taxId}</p>
                    </div>
                 )}
            </div>

            {/* From/To Details */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2">SENDER</h3>
                    <p className="font-bold">{USER_PROFILE.name}</p>
                    <p className="text-sm text-gray-600">{sourceAccount.nickname}</p>
                    <p className="text-sm text-gray-600 font-mono">{sourceAccount.accountNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2">RECIPIENT</h3>
                    <p className="font-bold">{transaction.recipient.fullName}</p>
                    <p className="text-sm text-gray-600">{isCredit ? transaction.description : transaction.recipient.bankName}</p>
                     <p className="text-sm text-gray-600 font-mono">{transaction.recipient.accountNumber}</p>
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y">
                             {!isCredit && (
                                <>
                                    <tr className="bg-gray-50"><td className="p-3 text-gray-600">Recipient Acct #</td><td className="p-3 text-right font-mono">{transaction.recipient.realDetails.accountNumber}</td></tr>
                                    <tr><td className="p-3 text-gray-600">Recipient SWIFT/BIC</td><td className="p-3 text-right font-mono">{transaction.recipient.realDetails.swiftBic}</td></tr>
                                </>
                            )}
                            {transaction.intermediaryBank && (
                                <tr className="bg-gray-50">
                                    <td className="p-3 text-gray-600">Intermediary Bank</td>
                                    <td className="p-3 text-right font-mono">
                                        {transaction.intermediaryBankName && <div>{transaction.intermediaryBankName}</div>}
                                        {transaction.intermediaryBank && <div>{transaction.intermediaryBank}</div>}
                                        {transaction.intermediaryBankAddress && <div className="text-xs">{transaction.intermediaryBankAddress}</div>}
                                    </td>
                                </tr>
                            )}
                            <tr className={transaction.intermediaryBank ? "" : "bg-gray-50"}><td className="p-3 text-gray-600">Amount {isCredit ? 'Deposited' : 'Sent'}</td><td className="p-3 text-right font-mono">{transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                            {!isCredit && <tr className={!transaction.intermediaryBank ? "" : "bg-gray-50"}><td className="p-3 text-gray-600">Transfer Fee</td><td className="p-3 text-right font-mono">{transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>}
                            {!isCredit && transaction.exchangeRate !== 1 && (
                                <>
                                <tr><td className="p-3 text-gray-600">Exchange Rate</td><td className="p-3 text-right font-mono">1 USD = {transaction.exchangeRate.toFixed(4)} {transaction.receiveCurrency}</td></tr>
                                <tr className="bg-gray-50"><td className="p-3 text-gray-600">Recipient Receives</td><td className="p-3 text-right font-mono font-bold">{transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })}</td></tr>
                                </>
                            )}
                            <tr className="bg-gray-100 font-bold"><td className="p-4">Total {isCredit ? 'Credited' : 'Debited'}</td><td className="p-4 text-right font-mono text-lg">{totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">Transaction Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg border text-sm">
                    <p><strong>Purpose:</strong> {transaction.purpose}</p>
                    <p><strong>Description:</strong> {transaction.description}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 border-t-2 border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>Thank you for banking with iCredit Union®.</p>
                <p>This is an automated receipt and does not require a signature. If you have any questions, please contact our support team.</p>
            </div>
        </div>
    );
};