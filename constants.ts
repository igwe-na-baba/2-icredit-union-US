import { Country, Recipient, Transaction, TransactionStatus, Card, CardTransaction, TransferLimits, Account, AccountType, CryptoAsset, CryptoHolding, SubscriptionService, SubscriptionServiceType, AppleCardDetails, AppleCardTransaction, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, Task, Airport, FlightBooking, UtilityBiller, UtilityBill, UtilityType, AtmLocation, AirtimeProvider, AirtimePurchase, PushNotificationSettings, VirtualCard, VerificationLevel, StaffProfile, CustomerReview, CharitableCause, RegionalHub } from './types';
import * as Icons from './components/Icons';
import { validateSwiftBic, validateAccountNumber } from './utils/validation';

export const ALL_COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$', phoneCode: '+1' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', phoneCode: '+44' },
    { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', phoneCode: '+49' },
    { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$', phoneCode: '+1' },
    { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$', phoneCode: '+61' },
    { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', phoneCode: '+81' },
    { code: 'FR', name: 'France', currency: 'EUR', symbol: '€', phoneCode: '+33' },
    { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', phoneCode: '+86' },
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', phoneCode: '+91' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', phoneCode: '+55' },
    { code: 'RU', name: 'Russia', currency: 'RUB', symbol: '₽', phoneCode: '+7' },
    { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€', phoneCode: '+39' },
    { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€', phoneCode: '+34' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: '$', phoneCode: '+52' },
    { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩', phoneCode: '+82' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp', phoneCode: '+62' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€', phoneCode: '+31' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF', phoneCode: '+41' },
    { code: 'TR', name: 'Turkey', currency: 'TRY', symbol: '₺', phoneCode: '+90' },
    { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr', phoneCode: '+46' },
];

export const CURRENCIES_LIST = ALL_COUNTRIES.map(c => ({
    code: c.currency,
    name: c.name,
    symbol: c.symbol,
    countryCode: c.code,
}));


export const SELF_RECIPIENT: Recipient = {
    id: 'self_01',
    fullName: 'Randy M. Chitwood',
    nickname: 'My Account',
    bankName: 'iCredit Union®',
    accountNumber: '**** 6789',
    country: ALL_COUNTRIES[0], // US
    deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: false },
    realDetails: { accountNumber: '9876543210', swiftBic: 'ICU-US-NY' }
};

export const INITIAL_RECIPIENTS: Recipient[] = [
    {
        id: 'rec_01',
        fullName: 'Jane Doe',
        nickname: 'London Office',
        bankName: 'Barclays',
        accountNumber: '**** 5678',
        country: ALL_COUNTRIES[1], // GB
        deliveryOptions: { bankDeposit: true, cardDeposit: true, cashPickup: false },
        realDetails: { accountNumber: 'GB29NWBK60161331926819', swiftBic: 'BARCGB22' },
        streetAddress: '123 Regent Street', city: 'London', postalCode: 'W1B 5AH', stateProvince: 'England'
    },
    {
        id: 'rec_02',
        fullName: 'John Smith',
        bankName: 'Chase Bank',
        accountNumber: '**** 1234',
        country: ALL_COUNTRIES[0], // US
        deliveryOptions: { bankDeposit: true, cardDeposit: false, cashPickup: true },
        realDetails: { accountNumber: '123456789', swiftBic: 'CHASUS33' },
        streetAddress: '456 Park Avenue', city: 'New York', postalCode: '10022', stateProvince: 'NY'
    }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: 'txn_01',
        accountId: 'acc_checking_01',
        recipient: INITIAL_RECIPIENTS[0],
        sendAmount: 1200,
        receiveAmount: 950.40,
        receiveCurrency: 'GBP',
        fee: 10,
        exchangeRate: 0.792,
        status: TransactionStatus.FUNDS_ARRIVED,
        estimatedArrival: new Date(Date.now() - 86400000),
        statusTimestamps: {
            [TransactionStatus.SUBMITTED]: new Date(Date.now() - 3 * 86400000),
            [TransactionStatus.CONVERTING]: new Date(Date.now() - 2 * 86400000),
            [TransactionStatus.IN_TRANSIT]: new Date(Date.now() - 86400000),
            [TransactionStatus.FUNDS_ARRIVED]: new Date(),
        },
        description: 'Invoice #INV-2024-001',
        type: 'debit',
        purpose: 'Business',
        senderLocation: 'New York, NY, USA',
        recipientLocation: 'London, UK',
        reviewed: true
    }
];

export const INITIAL_CARDS: Card[] = [];
export const INITIAL_VIRTUAL_CARDS: VirtualCard[] = [];
export const INITIAL_CARD_TRANSACTIONS: CardTransaction[] = [];
export const INITIAL_TRANSFER_LIMITS: TransferLimits = { daily: { amount: 5000, count: 10 }, weekly: { amount: 20000, count: 30 }, monthly: { amount: 50000, count: 100 } };

export const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc_checking_01', type: AccountType.CHECKING, nickname: 'Global Checking', accountNumber: '**** 1234', balance: 15678.90, features: ['FDIC Insured'], status: 'Active', fullAccountNumber: '1122334455' },
    { id: 'acc_business_01', type: AccountType.BUSINESS, nickname: 'My Startup LLC', accountNumber: '**** 5678', balance: 125000, features: ['Business Perks'], status: 'Active', fullAccountNumber: '2233445566' },
    { id: 'acc_savings_01', type: AccountType.SAVINGS, accountNumber: '**** 9012', balance: 78000.25, features: ['High-Yield'], status: 'Active', fullAccountNumber: '3344556677' },
    { id: 'acc_external_01', type: AccountType.EXTERNAL_LINKED, nickname: 'Chase Savings', accountNumber: '**** 3456', balance: 0, features: [], status: 'Active', fullAccountNumber: 'CHASE-SAVINGS-1234' }
];

export const getInitialCryptoAssets = (): CryptoAsset[] => [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: Icons.BtcIcon, price: 68000, change24h: 1.5, marketCap: 1.3 * 1e12, priceHistory: Array.from({length: 50}, () => 68000 * (1 + (Math.random() - 0.5) * 0.1)) },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: Icons.EthIcon, price: 3500, change24h: -0.5, marketCap: 420 * 1e9, priceHistory: Array.from({length: 50}, () => 3500 * (1 + (Math.random() - 0.5) * 0.1)) },
];

export const INITIAL_CRYPTO_HOLDINGS: CryptoHolding[] = [];
export const CRYPTO_TRADE_FEE_PERCENT = 0.01;

export const INITIAL_SUBSCRIPTIONS: SubscriptionService[] = [
    { id: 'sub1', provider: 'Netflix', plan: 'Premium', amount: 22.99, dueDate: new Date(Date.now() + 5 * 86400000), type: SubscriptionServiceType.TV, isPaid: false, isRecurring: true },
    { id: 'sub2', provider: 'Verizon Fios', plan: 'Gigabit', amount: 89.99, dueDate: new Date(Date.now() + 10 * 86400000), type: SubscriptionServiceType.INTERNET, isPaid: false, isRecurring: false },
];

export const INITIAL_APPLE_CARD_DETAILS: AppleCardDetails = { lastFour: '1122', balance: 345.67, creditLimit: 5000, availableCredit: 4654.33, spendingLimits: [{ category: 'Food & Drink', limit: 300 }] };
export const INITIAL_APPLE_CARD_TRANSACTIONS: AppleCardTransaction[] = [];
export const INITIAL_TRAVEL_PLANS: TravelPlan[] = [];
export const INITIAL_SECURITY_SETTINGS: SecuritySettings = { mfa: { enabled: true, method: 'sms' }, biometricsEnabled: true };
export const INITIAL_TRUSTED_DEVICES: TrustedDevice[] = [
    { id: 'dev1', deviceType: 'desktop', browser: 'Chrome on macOS', location: 'New York, NY', lastLogin: new Date(), isCurrent: true }
];
export const USER_PROFILE: UserProfile = { name: 'Randy M. Chitwood', email: 'randy.m.chitwood@icreditunion.com', phone: '+15550121234', profilePictureUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', lastLogin: { date: new Date(), from: 'New York, NY' } };
export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = { hapticsEnabled: true, theme: 'blue' };
export const THEME_COLORS: Record<PlatformTheme, string> = { blue: 'rgb(0, 82, 255)', green: '#16A34A', purple: '#7C2D91' };
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_FLIGHT_BOOKINGS: FlightBooking[] = [];
export const getUtilityBillers = (): UtilityBiller[] => [
    { id: 'util1', name: 'Con Edison', type: UtilityType.ELECTRICITY, icon: Icons.LightningBoltIcon, accountNumber: '****8899' }
];
export const INITIAL_UTILITY_BILLS: UtilityBill[] = [
    { id: 'bill1', billerId: 'util1', amount: 120.55, dueDate: new Date(Date.now() + 15 * 86400000), isPaid: false, isRecurring: true },
];
export const getAirtimeProviders = (): AirtimeProvider[] => [
    { id: 'air1', name: 'AT&T', logo: Icons.ATTIcon },
    { id: 'air2', name: 'T-Mobile', logo: Icons.TMobileIcon },
    { id: 'air3', name: 'Verizon', logo: Icons.VerizonIcon },
];
export const INITIAL_AIRTIME_PURCHASES: AirtimePurchase[] = [];
export const INITIAL_PUSH_SETTINGS: PushNotificationSettings = { transactions: true, security: true, promotions: true };

export const NEW_USER_PROFILE_TEMPLATE: UserProfile = {
    name: 'New User', email: '', profilePictureUrl: 'https://i.imgur.com/838vVfC.png',
    lastLogin: { date: new Date(), from: 'New Account' }
};

export const NEW_USER_ACCOUNTS_TEMPLATE: Omit<Account, 'id'>[] = [
    { type: AccountType.CHECKING, nickname: 'Global Checking', accountNumber: '**** 1001', balance: 1000, features: ['FDIC Insured'], status: 'Provisioning' },
    { type: AccountType.SAVINGS, accountNumber: '**** 1002', balance: 0, features: ['High-Yield'], status: 'Under Review' }
];

export const USER_PASSWORD = 'Password123!';
export const NETWORK_AUTH_CODE = 'AUTH789XYZ';
export const STANDARD_FEE = 10;
export const EXPRESS_FEE = 25;
export const USER_PIN = '1234';
export const CLEARANCE_CODE = 'ICU-CLEAR-2024';
export const TRANSACTION_CATEGORIES = ['Business', 'Personal', 'Family Support', 'Education', 'Medical', 'Travel', 'Other'];
export const TRANSFER_PURPOSES = ['Personal Transfer', 'Business Payment', 'Family Support', 'Education', 'Medical Expenses', 'Travel Expenses'];
export const STAFF_PROFILES: StaffProfile[] = [
    {
        id: 'staff1',
        name: 'Eleanor Vance',
        role: 'Chief Executive Officer',
        photoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        bio: 'With over 20 years of experience in international finance, Eleanor provides the vision and leadership that drives iCredit Union forward.'
    },
    {
        id: 'staff2',
        name: 'Marcus Holloway',
        role: 'Chief Technology Officer',
        photoUrl: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        bio: 'Marcus is the architect of our secure, cutting-edge platform, ensuring your data is always safe and your transactions are instant.'
    },
    {
        id: 'staff3',
        name: 'Isabella Rossi',
        role: 'Head of Global Compliance',
        photoUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        bio: 'Isabella navigates the complex world of international finance regulations, ensuring every transaction is compliant and secure.'
    }
];
export const CUSTOMER_REVIEWS: CustomerReview[] = [
    {
        id: 'review1',
        name: 'John D.',
        location: 'New York, USA',
        rating: 5,
        comment: 'Absolutely seamless experience sending money to my family in the UK. The app is intuitive and the rates are fantastic. Highly recommended!',
        photoUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
        id: 'review2',
        name: 'Sophie L.',
        location: 'Paris, France',
        rating: 5,
        comment: 'As a freelancer, getting paid from international clients used to be a headache. iCredit Union has made it incredibly simple and fast.',
        photoUrl: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
];
export const CHARITABLE_CAUSES: CharitableCause[] = [
    { id: 'cause1', title: 'Support an Orphanage', organization: 'WHO Partner Initiative', imageUrl: 'https://images.pexels.com/photos/1660623/pexels-photo-1660623.jpeg', description: 'Provide food, shelter, and education for orphaned children.', impactStatement: 'Your donation can give a child a safe home and a bright future.'},
    { id: 'cause2', title: 'Maternal Health Program', organization: 'WHO Partner Initiative', imageUrl: 'https://images.pexels.com/photos/7845123/pexels-photo-7845123.jpeg', description: 'Fund essential healthcare services for expectant mothers in underserved communities.', impactStatement: 'Help save the lives of mothers and newborns.'},
    { id: 'cause3', title: 'Shelter for the Homeless', organization: 'WHO Partner Initiative', imageUrl: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg', description: 'Help provide safe shelter, meals, and support services for homeless individuals and families.', impactStatement: 'Give someone a warm bed and a chance to rebuild their life.'}
];

export const REGIONAL_HUBS: RegionalHub[] = [
    { id: 'na', name: 'North America', hq: 'New York, USA', countries: 3, partnersCount: 300, uptime: 99.99, mapPosition: { top: '35%', left: '25%' }, compliance: ['CCPA', 'FINCEN'], partners: [{ name: 'Chase Bank', domain: 'chase.com' }, { name: 'Bank of America', domain: 'bankofamerica.com' }]},
    { id: 'eu', name: 'Europe', hq: 'London, UK', countries: 44, partnersCount: 500, uptime: 99.98, mapPosition: { top: '30%', left: '50%' }, compliance: ['GDPR', 'PSD2'], partners: [{ name: 'Barclays', domain: 'barclays.co.uk' }, { name: 'Deutsche Bank', domain: 'db.com' }]},
    { id: 'apac', name: 'Asia-Pacific', hq: 'Singapore', countries: 30, partnersCount: 400, uptime: 99.99, mapPosition: { top: '55%', left: '80%' }, compliance: ['PDPA', 'APRA'], partners: [{ name: 'DBS Bank', domain: 'dbs.com' }, { name: 'Mizuho Bank', domain: 'mizuhobank.co.jp' }]}
];

export const AIRPORTS: Airport[] = [
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', imageUrl: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', imageUrl: 'https://images.pexels.com/photos/4198031/pexels-photo-4198031.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', imageUrl: 'https://images.pexels.com/photos/59519/pexels-photo-59519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', imageUrl: 'https://images.pexels.com/photos/326119/pexels-photo-326119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

export const BANKS_BY_COUNTRY: { [key: string]: { name: string; domain: string }[] } = {
  US: [
    { name: 'Chase Bank', domain: 'chase.com' },
    { name: 'Bank of America', domain: 'bankofamerica.com' },
    { name: 'Wells Fargo', domain: 'wellsfargo.com' },
    { name: 'Citibank', domain: 'citi.com' },
    { name: 'PNC Bank', domain: 'pnc.com' },
  ],
  GB: [
    { name: 'Barclays', domain: 'barclays.co.uk' },
    { name: 'HSBC', domain: 'hsbc.co.uk' },
    { name: 'Lloyds Bank', domain: 'lloydsbank.com' },
    { name: 'NatWest', domain: 'natwest.com' },
  ],
  CA: [
      { name: 'Royal Bank of Canada', domain: 'rbcroyalbank.com' },
      { name: 'TD Canada Trust', domain: 'td.com' },
  ]
};

export const BANK_ACCOUNT_CONFIG: { [key: string]: { field1: any, field2?: any } } = {
  US: {
    field1: { name: 'routingNumber', label: 'Routing Number (ABA)', placeholder: 'e.g., 123456789', maxLength: 9, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{9}$/.test(v) ? null : 'Must be 9 digits.' },
    field2: { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g., 987654321', maxLength: 17, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{4,17}$/.test(v) ? null : 'Must be 4-17 digits.' }
  },
  GB: {
    field1: { name: 'sortCode', label: 'Sort Code', placeholder: 'e.g., 12-34-56', maxLength: 8, format: (v:string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3').slice(0, 8), validate: (v: string) => /^\d{2}-\d{2}-\d{2}$/.test(v) ? null : 'Must be in 12-34-56 format.' },
    field2: { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g., 12345678', maxLength: 8, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{8}$/.test(v) ? null : 'Must be 8 digits.' }
  },
  CA: {
      field1: { name: 'transitNumber', label: 'Transit Number (5 digits)', placeholder: 'e.g., 12345', maxLength: 5, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{5}$/.test(v) ? null : 'Must be 5 digits.' },
      field2: { name: 'accountNumber', label: 'Account Number (7-12 digits)', placeholder: 'e.g., 1234567', maxLength: 12, format: (v: string) => v.replace(/\D/g, ''), validate: (v: string) => /^\d{7,12}$/.test(v) ? null : 'Must be 7-12 digits.' }
  },
  default: {
    field1: { name: 'iban', label: 'IBAN', placeholder: 'e.g., DE89370400440532013000', validate: validateAccountNumber, format: (v: string) => v.replace(/\s/g, '').toUpperCase() },
    field2: { name: 'swiftBic', label: 'SWIFT/BIC', placeholder: 'e.g., COBADEFFXXX', validate: validateSwiftBic, format: (v: string) => v.replace(/\s/g, '').toUpperCase() }
  }
};

export const EXCHANGE_RATES: { [key: string]: number } = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.37,
    AUD: 1.51,
    JPY: 157.25,
    CNY: 7.25,
    INR: 83.54,
    BRL: 5.25,
    RUB: 89.37,
    MXN: 17.56,
    KRW: 1378.11,
    IDR: 16257.50,
    CHF: 0.90,
    TRY: 32.27,
    SEK: 10.49,
};

export const ATM_LOCATIONS: AtmLocation[] = [
    { id: 'atm1', name: 'iCU Branch - Midtown', address: '123 E 42nd St', city: 'New York', state: 'NY', zip: '10017', network: 'iCredit Union®', lat: 40.7527, lng: -73.9772, services: ['24/7 Access', 'Deposit Taking', 'Surcharge-Free'], hours: '24 Hours', streetViewImage: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' },
    { id: 'atm2', name: 'Allpoint at CVS', address: '456 Lexington Ave', city: 'New York', state: 'NY', zip: '10017', network: 'Allpoint', lat: 40.7540, lng: -73.9750, services: ['24/7 Access', 'Surcharge-Free'], hours: '24 Hours', streetViewImage: 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg' },
    { id: 'atm3', name: 'Visa Plus at Target', address: '517 E 117th St', city: 'New York', state: 'NY', zip: '10035', network: 'Visa Plus', lat: 40.7979, lng: -73.9332, services: ['24/7 Access'], hours: '8am - 10pm', streetViewImage: 'https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg' },
    { id: 'atm4', name: 'Cirrus at 7-Eleven', address: '201 E 34th St', city: 'New York', state: 'NY', zip: '10016', network: 'Cirrus', lat: 40.7455, lng: -73.9780, services: ['24/7 Access', 'Surcharge-Free'], hours: '24 Hours', streetViewImage: 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg' }
];