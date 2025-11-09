import { EXCHANGE_RATES as INITIAL_RATES } from '../constants';

let currentRates: { [key: string]: number } = { ...INITIAL_RATES };
let intervalId: number | null = null;

// Simulate small fluctuations to mimic a live market
const updateRates = () => {
    const newRates: { [key: string]: number } = {};
    for (const currency in currentRates) {
        if (currency === 'USD') {
            newRates[currency] = 1;
            continue;
        }
        const rate = currentRates[currency];
        const fluctuation = (Math.random() - 0.5) * 0.005; // +/- 0.25% fluctuation
        newRates[currency] = rate * (1 + fluctuation);
    }
    currentRates = newRates;
};

export const exchangeRateService = {
    getRates: (): { [key: string]: number } => {
        return currentRates;
    },
    startUpdates: (callback: (rates: { [key: string]: number }) => void) => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        // Start an interval to update rates every 3 seconds
        intervalId = window.setInterval(() => {
            updateRates();
            callback({ ...currentRates });
        }, 3000);
    },
    stopUpdates: () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
};
