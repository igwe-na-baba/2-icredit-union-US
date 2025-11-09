import React from 'react';
import { TrendingUpIcon, ArrowsRightLeftIcon } from './Icons';

interface InvestmentsProps {
    exchangeRates: { [key: string]: number };
}

const marketIndices = [
    { name: 'S&P 500', value: '5,487.03', change: '+21.43', percentChange: '+0.39%', positive: true },
    { name: 'NASDAQ', value: '17,857.02', change: '+167.64', percentChange: '+0.95%', positive: true },
    { name: 'Dow Jones', value: '38,778.10', change: '-62.30', percentChange: '-0.16%', positive: false },
    { name: 'FTSE 100', value: '8,281.55', change: '+4.57', percentChange: '+0.06%', positive: true },
];

const IndexCard: React.FC<typeof marketIndices[0]> = ({ name, value, change, percentChange, positive }) => {
    const color = positive ? 'text-green-400' : 'text-red-400';
    return (
        <div className="bg-slate-700/50 p-4 rounded-xl shadow-digital">
            <p className="text-sm font-semibold text-slate-400">{name}</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
            <p className={`text-sm font-semibold mt-1 ${color}`}>{change} ({percentChange})</p>
        </div>
    );
};

export const Investments: React.FC<InvestmentsProps> = ({ exchangeRates }) => {
    const baseCurrency = 'USD';
    const rates = Object.entries(exchangeRates).filter(([currency]) => currency !== baseCurrency);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-100">Markets & Rates</h2>
                <p className="text-md text-slate-400 mt-1">Stay informed on global markets and foreign exchange rates.</p>
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">Major Indices</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {marketIndices.map(index => <IndexCard key={index.name} {...index} />)}
                </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl shadow-digital">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-3">
                        <ArrowsRightLeftIcon className="w-6 h-6 text-primary" />
                        <span>Foreign Exchange Rates</span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Live rates based on {baseCurrency}.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Currency</th>
                                <th scope="col" className="px-6 py-3 text-right">Units per {baseCurrency}</th>
                                <th scope="col" className="px-6 py-3 text-right">{baseCurrency} per Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {rates.map(([currency, rate]) => (
                                <tr key={currency} className="hover:bg-slate-700">
                                    <td className="px-6 py-4 font-semibold text-slate-200">{currency}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">{Number(rate).toFixed(4)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">{(1 / Number(rate)).toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};