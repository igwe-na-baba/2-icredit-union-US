import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SendMoneyFlow } from './components/SendMoneyFlow';
import { Recipients } from './components/Recipients';
import { Transaction, Recipient, TransactionStatus, Card, CardTransaction, Notification, NotificationType, TransferLimits, Country, LoanApplication, LoanApplicationStatus, Account, VerificationLevel, CryptoHolding, CryptoAsset, SubscriptionService, AppleCardDetails, AppleCardTransaction, SpendingLimit, SpendingCategory, TravelPlan, TravelPlanStatus, SecuritySettings, TrustedDevice, UserProfile, PlatformSettings, PlatformTheme, View, Task, FlightBooking, UtilityBill, UtilityBiller, AdvisorResponse, BalanceDisplayMode, AccountType, AirtimePurchase, PushNotification, PushNotificationSettings, PrivacySettings, SavedSession, VirtualCard, CharitableCause, Donation, AirtimeProvider } from './types';
import { INITIAL_RECIPIENTS, INITIAL_TRANSACTIONS, INITIAL_CARDS, INITIAL_VIRTUAL_CARDS, INITIAL_CARD_TRANSACTIONS, INITIAL_TRANSFER_LIMITS, SELF_RECIPIENT, INITIAL_ACCOUNTS, getInitialCryptoAssets, INITIAL_CRYPTO_HOLDINGS, CRYPTO_TRADE_FEE_PERCENT, INITIAL_SUBSCRIPTIONS, INITIAL_APPLE_CARD_DETAILS, INITIAL_APPLE_CARD_TRANSACTIONS, INITIAL_TRAVEL_PLANS, INITIAL_SECURITY_SETTINGS, INITIAL_TRUSTED_DEVICES, USER_PROFILE, INITIAL_PLATFORM_SETTINGS, THEME_COLORS, INITIAL_TASKS, INITIAL_FLIGHT_BOOKINGS, INITIAL_UTILITY_BILLS, getUtilityBillers, getAirtimeProviders, INITIAL_AIRTIME_PURCHASES, INITIAL_PUSH_SETTINGS, NEW_USER_PROFILE_TEMPLATE, NEW_USER_ACCOUNTS_TEMPLATE, USER_PASSWORD, NETWORK_AUTH_CODE, EXCHANGE_RATES as STATIC_EXCHANGE_RATES, CHARITABLE_CAUSES } from './constants';
import * as Icons from './components/Icons';
import { Welcome } from './components/Welcome';
import { ActivityLog } from './components/ActivityLog';
import { Security } from './components/Security';
import { CardManagement } from './components/CardManagement';
import { Loans } from './components/Loans';
import { Support } from './components/Support';
import { Accounts } from './components/Accounts';
import { CryptoDashboard } from './components/CryptoDashboard';
import { ServicesDashboard } from './components/ServicesDashboard';
import { LogoutConfirmationModal } from './components/LogoutConfirmationModal';
import { InactivityModal } from './components/InactivityModal';
import { TravelCheckIn } from './components/TravelCheckIn';
import { PlatformFeatures } from './components/PlatformFeatures';
import { DynamicIslandSimulator } from './components/DynamicIslandSimulator';
import { BankingChat } from './components/BankingChat';
import { Tasks } from './components/Tasks';
import { Flights } from './components/Flights';
import { Utilities } from './components/Utilities';
import { Integrations } from './components/Integrations';
import { FinancialAdvisor } from './components/FinancialAdvisor';
import {
  sendTransactionalEmail,
  generateTransactionReceiptEmail,
  generateNewRecipientEmail,
  generateCardStatusEmail,
  generateFundsArrivedEmail,
  sendSmsNotification,
  generateLoginAlertEmail,
  generateLoginAlertSms,
  generateNewRecipientSms,
  generateTransactionReceiptSms,
  generateFundsArrivedSms,
  generateFullWelcomeEmail,
  generateFullWelcomeSms,
  generateTaskReminderEmail,
  generateTaskReminderSms,
  generateDepositConfirmationEmail,
  generateDepositConfirmationSms,
  generateWelcomeEmail,
  generateWelcomeSms,
  generateSupportTicketConfirmationEmail,
  generateSupportTicketConfirmationSms,
  generateDonationConfirmationEmail,
  generateDonationConfirmationSms,
} from './services/notificationService';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Insurance } from './components/Insurance';
import { Investments } from './components/Investments';
import { AtmLocator } from './components/AtmLocator';
import { Quickteller } from './components/Quickteller';
import { QrScanner } from './components/QrScanner';
import { PrivacyCenter } from './components/PrivacyCenter';
import { WireTransfer } from './components/WireTransfer';
import { DigitalWallet } from './components/DigitalWallet';
import { ReviewsAndStaff } from './components/ReviewsAndStaff';
import { GlobalCauses } from './components/GlobalCauses';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { FeePaymentModal } from './components/FeePaymentModal';
import { Footer } from './components/Footer';
import { TermsOfService } from './components/TermsOfService';
import { CookiesPolicy } from './components/CookiesPolicy';
import { GlobalNetwork } from './components/GlobalNetwork';
import { RecurringPayments } from './components/RecurringPayments';


import { OpeningSequence } from './components/OpeningSequence';
import { AccountCreationFlow } from './components/AccountCreationFlow';
import { LoggedOut } from './components/LoggedOut';
import { ProfileSignIn } from './components/ProfileSignIn';
import { PushNotificationToast } from './components/PushNotificationToast';
import { ResumeSessionModal } from './components/ResumeSessionModal';
import { LoggingOut } from './components/LoggingOut';
import { AdvancedFirstPage } from './components/AdvancedFirstPage';

import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';

import { ContactSupportModal } from './components/ContactSupportModal';
import { exchangeRateService } from './services/exchangeRateService';
import { AddRecipientModal } from './components/AddRecipientModal';
import { LinkBankAccountModal } from './components/LinkBankAccountModal';

type AuthState = 'intro' | 'opening' | 'logged_out' | 'profile_signin' | 'logged_in' | 'logging_out' | 'account_creation';
const SESSION_TIMEOUT = 300000; // 5 minutes

const AppComponent = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSendMoneyFlowOpen, setIsSendMoneyFlowOpen] = useState(false);
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);
  const [recipientToEdit, setRecipientToEdit] = useState<Recipient | null>(null);
  const [initialSendMoneyTab, setInitialSendMoneyTab] = useState<'send' | 'split' | 'deposit' | undefined>(undefined);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isContactSupportModalOpen, setIsContactSupportModalOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [feePaymentState, setFeePaymentState] = useState<{ isOpen: boolean; transaction: Transaction | null }>({ isOpen: false, transaction: null });
  const [isLinkAccountModalOpen, setIsLinkAccountModalOpen] = useState(false);

  // Data states
  const [userProfile, setUserProfile] = useState<UserProfile>(USER_PROFILE);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(INITIAL_VIRTUAL_CARDS);
  const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>(INITIAL_CARD_TRANSACTIONS);
  const [transferLimits, setTransferLimits] = useState<TransferLimits>(INITIAL_TRANSFER_LIMITS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [verificationLevel, setVerificationLevel] = useState<VerificationLevel>(VerificationLevel.LEVEL_1);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>(getInitialCryptoAssets());
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(INITIAL_CRYPTO_HOLDINGS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionService[]>(INITIAL_SUBSCRIPTIONS);
  const [appleCardDetails, setAppleCardDetails] = useState<AppleCardDetails>(INITIAL_APPLE_CARD_DETAILS);
  const [appleCardTransactions, setAppleCardTransactions] = useState<AppleCardTransaction[]>(INITIAL_APPLE_CARD_TRANSACTIONS);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>(INITIAL_TRAVEL_PLANS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(INITIAL_SECURITY_SETTINGS);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_TRUSTED_DEVICES);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [utilityBillers] = useState<UtilityBiller[]>(getUtilityBillers());
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>(INITIAL_UTILITY_BILLS);
  const [airtimeProviders] = useState<AirtimeProvider[]>(getAirtimeProviders());
  const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>(INITIAL_AIRTIME_PURCHASES);
  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(INITIAL_PUSH_SETTINGS);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ ads: true, sharing: true, email: { transactions: true, security: true, promotions: true }, sms: { transactions: true, security: true, promotions: false } });
  const [linkedServices, setLinkedServices] = useState<Record<string, string>>({ PayPal: 'randy.doe@email.com' });
  const [donations, setDonations] = useState<Donation[]>([]);

  const [financialAnalysis, setFinancialAnalysis] = useState<AdvisorResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(STATIC_EXCHANGE_RATES);

  const [authState, setAuthState] = useState<AuthState>('intro');
  const [isInactive, setIsInactive] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  const inactivityTimer = useRef<number | undefined>();

  const internalAccounts = useMemo(() => accounts.filter(acc => acc.type !== AccountType.EXTERNAL_LINKED), [accounts]);
  
  const handleUpdatePushSettings = (update: Partial<PushNotificationSettings>) => {
    setPushSettings(prev => ({ ...prev, ...update }));
  };

  const handleUpdatePrivacySettings = (update: Partial<PrivacySettings>) => {
      setPrivacySettings(prev => ({ ...prev, ...update }));
  };

  const onOpenSendMoneyFlow = useCallback((initialTab?: 'send' | 'split' | 'deposit') => {
    setInitialSendMoneyTab(initialTab);
    setIsSendMoneyFlowOpen(true);
  }, []);

  const handleSetActiveView = useCallback((view: View) => {
    if (view === 'send') {
      onOpenSendMoneyFlow('send');
    } else {
      setActiveView(view);
    }
    setIsMenuOpen(false); // Close menu after any selection
  }, [onOpenSendMoneyFlow]);
  
  const addNotification = useCallback((type: NotificationType, title: string, message: string, linkTo?: View) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      linkTo,
    };
    setNotifications(prev => [newNotification, ...prev]);
    const newPush: PushNotification = { id: newNotification.id, type, title, message };
    setPushNotifications(prev => [newPush, ...prev]);
  }, []);

    const addRecipient = (data: any) => {
        const newRecipient: Recipient = {
            id: `rec_${Date.now()}`,
            fullName: data.fullName,
            nickname: data.nickname,
            bankName: data.bankName,
            accountNumber: `**** ${data.accountNumber.slice(-4)}`,
            country: data.country,
            deliveryOptions: {
                bankDeposit: true,
                cardDeposit: false,
                cashPickup: data.cashPickupEnabled,
            },
            realDetails: {
                accountNumber: data.accountNumber,
                swiftBic: data.swiftBic,
            },
            streetAddress: data.streetAddress,
            city: data.city,
            stateProvince: data.stateProvince,
            postalCode: data.postalCode,
            phone: data.phone,
            bankAddress: data.bankAddress,
            notes: data.notes,
        };
        setRecipients(prev => [newRecipient, ...prev]);
        addNotification(NotificationType.ACCOUNT, 'Recipient Added', `You've successfully added ${data.fullName}.`);
        const { subject, body } = generateNewRecipientEmail(userProfile.name, data.fullName);
        sendTransactionalEmail(userProfile.email, subject, body);
        if (userProfile.phone) sendSmsNotification(userProfile.phone, generateNewRecipientSms(data.fullName));
    };

    const onUpdateRecipient = (recipientId: string, data: any) => {
        setRecipients(prev => prev.map(r => {
            if (r.id === recipientId) {
                return {
                    ...r,
                    ...data,
                    accountNumber: `**** ${data.accountNumber.slice(-4)}`,
                    realDetails: {
                        accountNumber: data.accountNumber,
                        swiftBic: data.swiftBic,
                    },
                };
            }
            return r;
        }));
        addNotification(NotificationType.ACCOUNT, 'Recipient Updated', `Details for ${data.fullName} have been updated.`);
    };

    const onDeleteRecipient = (recipientId: string) => {
        setRecipients(prev => prev.filter(r => r.id !== recipientId));
        addNotification(NotificationType.ACCOUNT, 'Recipient Deleted', `The recipient has been successfully removed.`);
    };

    const handleLinkService = (name: string, id: string) => {
        setLinkedServices(prev => ({...prev, [name]: id}));
    };
    
    const handleUnlinkService = (name: string) => {
        setLinkedServices(prev => {
            const newServices = {...prev};
            delete newServices[name];
            return newServices;
        });
    };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(() => {
        setIsInactive(true);
    }, SESSION_TIMEOUT);
  }, []);

  useEffect(() => {
      if (authState === 'logged_in') {
          resetInactivityTimer();
          window.addEventListener('mousemove', resetInactivityTimer);
          window.addEventListener('keydown', resetInactivityTimer);
          return () => {
              window.removeEventListener('mousemove', resetInactivityTimer);
              window.removeEventListener('keydown', resetInactivityTimer);
              if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
          };
      }
  }, [authState, resetInactivityTimer]);
  
  const handleLogin = () => {
    setAuthState('opening');
    addNotification(NotificationType.SECURITY, 'Successful Login', `Welcome back, ${userProfile.name}!`);
    const { subject, body } = generateLoginAlertEmail(userProfile.name, new Date(), 'New York, NY (Simulated)', 'Chrome on macOS');
    sendTransactionalEmail(userProfile.email, subject, body);
    if (userProfile.phone) {
      sendSmsNotification(userProfile.phone, generateLoginAlertSms('New York, NY (Simulated)'));
    }
    resetInactivityTimer();
  };

  const handleLogout = () => {
      setShowLogoutConfirm(false);
      setAuthState('logging_out');
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  };

  const handleFinalLogout = () => {
      setSavedSession({ view: activeView, timestamp: Date.now() });
      setAuthState('logged_out');
      setActiveView('dashboard');
      setIsMenuOpen(false);
  };

  const handleCreateAccount = (formData: any) => {
    const newUserProfile: UserProfile = {
      ...NEW_USER_PROFILE_TEMPLATE,
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    };
    const newAccounts: Account[] = NEW_USER_ACCOUNTS_TEMPLATE.map(acc => ({
      ...acc,
      id: `acc_${Date.now()}_${Math.random()}`,
    }));

    setUserProfile(newUserProfile);
    setAccounts(newAccounts);
    setRecipients(INITIAL_RECIPIENTS);
    setTransactions([]);
    
    const { subject, body } = generateFullWelcomeEmail(newUserProfile.name);
    sendTransactionalEmail(newUserProfile.email, subject, body);
    if (newUserProfile.phone) {
        sendSmsNotification(newUserProfile.phone, generateFullWelcomeSms(newUserProfile.name));
    }
    setAuthState('opening');
  };

  const handleSwitchUser = () => {
      setUserProfile(NEW_USER_PROFILE_TEMPLATE);
      setAccounts([]);
      setTransactions([]);
      setRecipients([]);
      setSavedSession(null);
      setAuthState('profile_signin');
  };

  const handleMarkNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const ongoingTransaction = useMemo(() => {
    return transactions.find(tx => tx.status !== TransactionStatus.FUNDS_ARRIVED && tx.status !== TransactionStatus.FLAGGED_AWAITING_CLEARANCE);
  }, [transactions]);

  const handleSupportSubmit = async (data: { topic: string; transactionId?: string; message: string }) => {
      addNotification(NotificationType.SUPPORT, 'Support Ticket Created', `We've received your request about "${data.topic}" and will get back to you soon.`);
      const { subject, body } = generateSupportTicketConfirmationEmail(userProfile.name, data.topic);
      sendTransactionalEmail(userProfile.email, subject, body);
      if (userProfile.phone) {
          sendSmsNotification(userProfile.phone, generateSupportTicketConfirmationSms(data.topic));
      }
  };
  
  const createTransaction = (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>): Transaction | null => {
    const sourceAccount = accounts.find(acc => acc.id === transaction.accountId);
    if (!sourceAccount || (sourceAccount.type !== AccountType.EXTERNAL_LINKED && sourceAccount.balance < transaction.sendAmount + transaction.fee)) {
        addNotification(NotificationType.TRANSACTION, 'Transaction Failed', 'Insufficient funds for the transaction.');
        return null;
    }
    
    const isFlagged = transaction.sendAmount >= 1000 && transaction.recipient.country.code !== 'US';
    if (!isFlagged && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      setAccounts(prevAccounts =>
        prevAccounts.map(acc =>
          acc.id === transaction.accountId
            ? { ...acc, balance: acc.balance - (transaction.sendAmount + transaction.fee) }
            : acc
        )
      );
    }
    
    const newTransaction: Transaction = {
        ...transaction,
        id: `txn_${Date.now()}`,
        status: isFlagged ? TransactionStatus.FLAGGED_AWAITING_CLEARANCE : TransactionStatus.SUBMITTED,
        estimatedArrival: new Date(Date.now() + 3 * 86400000),
        statusTimestamps: {
            [TransactionStatus.SUBMITTED]: new Date(),
            ...(isFlagged && { [TransactionStatus.FLAGGED_AWAITING_CLEARANCE]: new Date() })
        },
        type: 'debit'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(NotificationType.TRANSACTION, 'Transaction Submitted', `Your transfer of ${newTransaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} to ${newTransaction.recipient.fullName} has been submitted.`);
    
    const { subject, body } = generateTransactionReceiptEmail(newTransaction, userProfile.name);
    sendTransactionalEmail(userProfile.email, subject, body);
    sendSmsNotification(userProfile.phone!, generateTransactionReceiptSms(newTransaction));
    
    return newTransaction;
  };
  
  const createWireTransaction = (wireData: any): Transaction | null => {
    const sourceAccount = accounts.find(acc => acc.id === wireData.sourceAccountId);
    if (!sourceAccount || sourceAccount.balance < wireData.totalDebit) {
        addNotification(NotificationType.TRANSACTION, 'Wire Transfer Failed', 'Insufficient funds for the wire transfer.');
        return null;
    }

    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.id === wireData.sourceAccountId
          ? { ...acc, balance: acc.balance - wireData.totalDebit }
          : acc
      )
    );

    const newTransaction: Transaction = {
      id: `wire_${Date.now()}`,
      accountId: wireData.sourceAccountId,
      recipient: wireData.recipient,
      sendAmount: wireData.sendAmount,
      receiveAmount: wireData.receiveAmount,
      receiveCurrency: wireData.recipient.country.currency,
      fee: wireData.fee,
      exchangeRate: wireData.exchangeRate,
      status: TransactionStatus.SUBMITTED, // Wires start as submitted
      estimatedArrival: new Date(Date.now() + (wireData.deliverySpeed === 'standard' ? 3 : 1) * 86400000),
      statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date() },
      description: wireData.memo || `Wire to ${wireData.recipient.fullName}`,
      type: 'debit',
      purpose: wireData.purpose,
      transferType: wireData.recipient.country.code === 'US' ? 'Domestic Wire' : 'International Wire',
      wireReferenceNumber: `ICUWIRE${Date.now().toString().slice(-8)}`,
      intermediaryBank: wireData.intermediaryBank,
      intermediaryBankName: wireData.intermediaryBankName,
      intermediaryBankAddress: wireData.intermediaryBankAddress,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    addNotification(NotificationType.TRANSACTION, 'Wire Transfer Submitted', `Your wire of ${newTransaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been initiated.`);
    
    return newTransaction;
  };

  const handleAuthorizeTransaction = (transactionId: string) => {
    const transactionToAuthorize = transactions.find(tx => tx.id === transactionId);
    if (!transactionToAuthorize) return;

    if (transactionToAuthorize.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE) {
      const sourceAccount = accounts.find(acc => acc.id === transactionToAuthorize.accountId);
      if (sourceAccount && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
          setAccounts(prevAccounts =>
              prevAccounts.map(acc =>
                  acc.id === transactionToAuthorize.accountId
                      ? { ...acc, balance: acc.balance - (transactionToAuthorize.sendAmount + transactionToAuthorize.fee) }
                      : acc
              )
          );
      }
    }

    setTransactions(prev =>
        prev.map(tx =>
            tx.id === transactionId
                ? {
                    ...tx,
                    status: TransactionStatus.CLEARED,
                    taxId: `IMF-AUTH-${Date.now().toString().slice(-6)}`,
                    statusTimestamps: {
                        ...tx.statusTimestamps,
                        [TransactionStatus.CLEARED]: new Date()
                    }
                  }
                : tx
        )
    );
    addNotification(NotificationType.TRANSACTION, 'Transaction Authorized', `Your transaction ${transactionId.slice(-8)} has been cleared and is now being processed.`);
  };

  const handleOpenFeePayment = (transaction: Transaction) => {
    setIsSendMoneyFlowOpen(false);
    setFeePaymentState({ isOpen: true, transaction });
  };
  
  const handleFeePayment = (sourceAccountId: string, feeAmount: number, transactionId: string): boolean => {
      const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);
      if (!sourceAccount || sourceAccount.balance < feeAmount) {
          return false;
      }
  
      setAccounts(prevAccounts =>
          prevAccounts.map(acc =>
              acc.id === sourceAccountId ? { ...acc, balance: acc.balance - feeAmount } : acc
          )
      );
      
      const feeTransaction: Transaction = {
          id: `txn_fee_${Date.now()}`,
          accountId: sourceAccountId,
          recipient: SELF_RECIPIENT,
          sendAmount: feeAmount,
          receiveAmount: feeAmount,
          fee: 0,
          exchangeRate: 1,
          status: TransactionStatus.FUNDS_ARRIVED,
          estimatedArrival: new Date(),
          statusTimestamps: { [TransactionStatus.SUBMITTED]: new Date(), [TransactionStatus.FUNDS_ARRIVED]: new Date() },
          description: `Compliance fee for TXN #${transactionId.slice(-8)}`,
          type: 'debit',
          purpose: 'Other',
      };
      setTransactions(prev => [feeTransaction, ...prev]);
  
      handleAuthorizeTransaction(transactionId);
      
      addNotification(NotificationType.TRANSACTION, 'Compliance Fee Paid', `A fee of ${feeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been paid for transaction ${transactionId.slice(-8)}.`);
  
      setFeePaymentState({ isOpen: false, transaction: null });
  
      return true;
  };

  const handlePaySubscription = (subscriptionId: string): boolean => {
    const sub = subscriptions.find(s => s.id === subscriptionId);
    const account = accounts.find(a => a.type === AccountType.CHECKING);
    if (!sub || !account || account.balance < sub.amount) {
      addNotification(NotificationType.SUBSCRIPTION, 'Payment Failed', `Insufficient funds to pay for ${sub?.provider}.`);
      return false;
    }
    setAccounts(prev => prev.map(a => 
      a.id === account.id ? { ...a, balance: a.balance - sub.amount } : a
    ));
    setSubscriptions(prev => prev.map(s => 
      s.id === subscriptionId ? { ...s, isPaid: true } : s
    ));
    addNotification(NotificationType.SUBSCRIPTION, 'Subscription Paid', `${sub.provider} subscription of ${sub.amount.toLocaleString('en-US', {style:'currency', currency: 'USD'})} has been paid.`);
    return true;
  };

  const handleToggleSubscriptionAutopay = (subscriptionId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscriptionId ? { ...sub, isRecurring: !sub.isRecurring } : sub
      )
    );
  };

  const handlePayUtilityBill = (billId: string, sourceAccountId: string): boolean => {
    const bill = utilityBills.find(b => b.id === billId);
    const account = accounts.find(a => a.id === sourceAccountId);

    if (!bill || !account || account.balance < bill.amount) {
      const biller = utilityBillers.find(b => b.id === bill?.billerId);
      addNotification(NotificationType.TRANSACTION, 'Payment Failed', `Insufficient funds to pay ${biller?.name} bill.`);
      return false;
    }
    setAccounts(prev => prev.map(a => 
      a.id === account.id ? { ...a, balance: a.balance - bill.amount } : a
    ));
    setUtilityBills(prev => prev.map(b => 
      b.id === billId ? { ...b, isPaid: true } : b
    ));
    const biller = utilityBillers.find(b => b.id === bill.billerId);
    addNotification(NotificationType.TRANSACTION, 'Bill Paid', `${biller?.name} bill of ${bill.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} has been paid.`);
    return true;
  };

  const handleToggleUtilityAutopay = (billId: string) => {
    setUtilityBills(prev => 
      prev.map(bill => 
        bill.id === billId ? { ...bill, isRecurring: !bill.isRecurring } : bill
      )
    );
  };

    const addLoanApplication = (application: Omit<LoanApplication, 'id' | 'status' | 'submittedDate'>) => {
        const newApp: LoanApplication = {
            ...application,
            id: `loan_${Date.now()}`,
            status: LoanApplicationStatus.PENDING,
            submittedDate: new Date(),
        };
        setLoanApplications(prev => [newApp, ...prev]);
    };

    const onBuyCrypto = (assetId: string, usdAmount: number, assetPrice: number): boolean => {
        const account = accounts.find(a => a.type === AccountType.CHECKING);
        if (!account || account.balance < usdAmount) {
            addNotification(NotificationType.CRYPTO, 'Purchase Failed', 'Insufficient funds in your checking account.');
            return false;
        }
        const cryptoAmount = usdAmount / assetPrice;
        setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, balance: a.balance - usdAmount } : a));
        setCryptoHoldings(prev => {
            const existing = prev.find(h => h.assetId === assetId);
            if (existing) {
                const totalAmount = existing.amount + cryptoAmount;
                const totalCost = (existing.avgBuyPrice * existing.amount) + usdAmount;
                const newAvgPrice = totalCost / totalAmount;
                return prev.map(h => h.assetId === assetId ? { ...h, amount: totalAmount, avgBuyPrice: newAvgPrice } : h);
            } else {
                return [...prev, { assetId, amount: cryptoAmount, avgBuyPrice: assetPrice }];
            }
        });
        addNotification(NotificationType.CRYPTO, 'Purchase Successful', `You bought ${cryptoAmount.toFixed(6)} ${assetId.toUpperCase()}.`);
        return true;
    };

    const onSellCrypto = (assetId: string, cryptoAmount: number, assetPrice: number): boolean => {
        const holding = cryptoHoldings.find(h => h.assetId === assetId);
        if (!holding || holding.amount < cryptoAmount) {
            addNotification(NotificationType.CRYPTO, 'Sale Failed', 'Insufficient asset balance.');
            return false;
        }
        const usdAmount = cryptoAmount * assetPrice;
        const account = accounts.find(a => a.type === AccountType.CHECKING);
        if (account) {
            setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, balance: a.balance + usdAmount } : a));
        }
        setCryptoHoldings(prev => {
            const newAmount = holding.amount - cryptoAmount;
            if (newAmount < 0.000001) { // Threshold to remove holding
                return prev.filter(h => h.assetId !== assetId);
            } else {
                return prev.map(h => h.assetId === assetId ? { ...h, amount: newAmount } : h);
            }
        });
        addNotification(NotificationType.CRYPTO, 'Sale Successful', `You sold ${cryptoAmount.toFixed(6)} ${assetId.toUpperCase()}.`);
        return true;
    };

    const { cryptoPortfolioValue, portfolioChange24h } = useMemo(() => {
        let totalValue = 0;
        let totalValue24hAgo = 0;

        cryptoHoldings.forEach(holding => {
            const asset = cryptoAssets.find(a => a.id === holding.assetId);
            if (asset) {
                const currentValue = holding.amount * asset.price;
                totalValue += currentValue;
                const price24hAgo = asset.priceHistory[0] || asset.price;
                totalValue24hAgo += holding.amount * price24hAgo;
            }
        });

        const change = totalValue - totalValue24hAgo;
        const percentChange = totalValue24hAgo > 0 ? (change / totalValue24hAgo) * 100 : 0;

        return { cryptoPortfolioValue: totalValue, portfolioChange24h: percentChange };
    }, [cryptoHoldings, cryptoAssets]);

    const totalNetWorth = useMemo(() => {
        const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        return totalAccountBalance + cryptoPortfolioValue;
    }, [accounts, cryptoPortfolioValue]);
    
    const handleLinkAccountSuccess = (bankName: string, accountName: string, lastFour: string) => {
        const newAccount: Account = {
            id: `acc_ext_${Date.now()}`,
            type: AccountType.EXTERNAL_LINKED,
            nickname: `${bankName} ${accountName}`,
            accountNumber: `**** ${lastFour}`,
            balance: 0,
            features: [],
            status: 'Active',
        };
        setAccounts(prev => [...prev, newAccount]);
        setIsLinkAccountModalOpen(false);
        addNotification(NotificationType.ACCOUNT, 'Account Linked', `Successfully linked your ${bankName} account.`);
    };

  const mainContent = useMemo(() => {
    switch (activeView) {
        case 'dashboard':
            return <Dashboard accounts={accounts} transactions={transactions} setActiveView={setActiveView} recipients={recipients} createTransaction={createTransaction} cryptoPortfolioValue={cryptoPortfolioValue} portfolioChange24h={portfolioChange24h} travelPlans={travelPlans} totalNetWorth={totalNetWorth} balanceDisplayMode={'global'} userProfile={userProfile} onOpenSendMoneyFlow={onOpenSendMoneyFlow} exchangeRates={exchangeRates} />;
        case 'history':
            return <ActivityLog transactions={transactions} onUpdateTransactions={() => {}} />;
        case 'recipients':
            return <Recipients recipients={recipients} addRecipient={() => { setRecipientToEdit(null); setIsAddRecipientModalOpen(true); }} onUpdateRecipient={onUpdateRecipient} onDeleteRecipient={onDeleteRecipient} />;
        case 'security':
            return <Security 
                transferLimits={transferLimits} onUpdateLimits={setTransferLimits} 
                verificationLevel={verificationLevel} onVerificationComplete={setVerificationLevel}
                securitySettings={securitySettings} onUpdateSecuritySettings={(update) => setSecuritySettings(prev => ({ ...prev, ...update }))}
                trustedDevices={trustedDevices} onRevokeDevice={(deviceId) => setTrustedDevices(prev => prev.filter(d => d.id !== deviceId))}
                onChangePassword={() => setIsChangePasswordModalOpen(true)}
                transactions={transactions}
                pushNotificationSettings={pushSettings}
                onUpdatePushNotificationSettings={handleUpdatePushSettings}
                privacySettings={privacySettings}
                onUpdatePrivacySettings={handleUpdatePrivacySettings}
                userProfile={userProfile}
                onUpdateProfilePicture={(url) => setUserProfile(p => ({...p, profilePictureUrl: url}))}
            />;
        case 'cards':
            return <CardManagement 
                cards={cards} 
                virtualCards={virtualCards}
                cardTransactions={cardTransactions}
                onUpdateCardControls={() => {}}
                onAddCard={() => {}}
                accountBalance={accounts.find(a => a.type === AccountType.CHECKING)?.balance || 0}
                onAddFunds={() => {}}
                onCreateVirtualCard={() => {}}
            />;
        case 'loans':
            return <Loans loanApplications={loanApplications} addLoanApplication={addLoanApplication} addNotification={addNotification} />;
        case 'insurance':
            return <Insurance addNotification={addNotification} />;
        case 'support':
            return <Support />;
        case 'accounts':
            return <Accounts accounts={accounts} transactions={transactions} verificationLevel={verificationLevel} onUpdateAccountNickname={() => {}} onLinkAccount={() => setIsLinkAccountModalOpen(true)} />;
        case 'crypto':
            return <CryptoDashboard cryptoAssets={cryptoAssets} setCryptoAssets={setCryptoAssets} holdings={cryptoHoldings} checkingAccount={accounts.find(a => a.type === AccountType.CHECKING)} onBuy={onBuyCrypto} onSell={onSellCrypto} />;
        case 'services':
            return <ServicesDashboard 
                subscriptions={subscriptions}
                appleCardDetails={appleCardDetails}
                appleCardTransactions={appleCardTransactions}
                onPaySubscription={handlePaySubscription}
                onUpdateSpendingLimits={(limits) => setAppleCardDetails(prev => ({...prev, spendingLimits: limits}))}
                onUpdateTransactionCategory={(id, cat) => setAppleCardTransactions(prev => prev.map(tx => tx.id === id ? {...tx, category: cat} : tx))}
                onToggleSubscriptionAutopay={handleToggleSubscriptionAutopay}
            />;
        case 'checkin':
            return <TravelCheckIn travelPlans={travelPlans} addTravelPlan={() => {}} addNotification={addNotification} />;
        case 'platform':
            return <PlatformFeatures settings={platformSettings} onUpdateSettings={() => {}} />;
        case 'tasks':
            return <Tasks tasks={tasks} addTask={() => {}} toggleTask={() => {}} deleteTask={() => {}} deleteCompletedTasks={() => {}} />;
        case 'flights':
            return <Flights bookings={flightBookings} onBookFlight={() => false} accounts={internalAccounts} setActiveView={setActiveView} />;
        case 'utilities':
            return <Utilities bills={utilityBills} billers={utilityBillers} onPayBill={handlePayUtilityBill} accounts={internalAccounts} setActiveView={setActiveView} onToggleUtilityAutopay={handleToggleUtilityAutopay} />;
        case 'integrations':
            return <Integrations linkedServices={linkedServices} onLinkService={handleLinkService} onUnlinkService={handleUnlinkService} />;
        case 'advisor':
            return <FinancialAdvisor analysis={financialAnalysis} isAnalyzing={isAnalyzing} analysisError={analysisError} runAnalysis={() => {}} setActiveView={setActiveView} />;
        case 'invest':
            return <Investments exchangeRates={exchangeRates} />;
        case 'atmLocator':
            return <AtmLocator />;
        case 'quickteller':
            return <Quickteller airtimeProviders={airtimeProviders} purchases={airtimePurchases} accounts={internalAccounts} onPurchase={() => false} setActiveView={setActiveView} />;
        case 'qrScanner':
            return <QrScanner hapticsEnabled={platformSettings.hapticsEnabled} />;
        case 'privacy':
            return <PrivacyCenter settings={privacySettings} onUpdateSettings={handleUpdatePrivacySettings} />;
        case 'wire':
            return <WireTransfer accounts={internalAccounts} recipients={recipients} onBackToDashboard={() => setActiveView('dashboard')} createWireTransaction={createWireTransaction} />;
        case 'wallet':
            return <DigitalWallet setActiveView={setActiveView} onOpenSendMoneyFlow={onOpenSendMoneyFlow} linkedServices={linkedServices} transactions={transactions} />;
        case 'reviews':
            return <ReviewsAndStaff />;
        case 'causes':
            return <GlobalCauses accounts={internalAccounts} handleMakeDonation={() => false} />;
        case 'network':
            return <GlobalNetwork />;
        case 'about':
            return <AboutUs />;
        case 'contact':
            return <ContactUs />;
        case 'terms':
            return <TermsOfService />;
        case 'cookies':
            return <CookiesPolicy />;
        case 'recurring':
            return <RecurringPayments 
                subscriptions={subscriptions} 
                utilityBills={utilityBills} 
                utilityBillers={utilityBillers}
                accounts={internalAccounts}
                onToggleSubscriptionAutopay={handleToggleSubscriptionAutopay}
                onToggleUtilityAutopay={handleToggleUtilityAutopay}
            />;
        default:
            return <Dashboard accounts={accounts} transactions={transactions} setActiveView={setActiveView} recipients={recipients} createTransaction={createTransaction} cryptoPortfolioValue={cryptoPortfolioValue} portfolioChange24h={portfolioChange24h} travelPlans={travelPlans} totalNetWorth={totalNetWorth} balanceDisplayMode={'global'} userProfile={userProfile} onOpenSendMoneyFlow={onOpenSendMoneyFlow} exchangeRates={exchangeRates} />;
    }
  }, [activeView, accounts, transactions, recipients, travelPlans, userProfile, exchangeRates, transferLimits, verificationLevel, securitySettings, trustedDevices, pushSettings, privacySettings, cards, virtualCards, cardTransactions, loanApplications, cryptoAssets, cryptoHoldings, subscriptions, appleCardDetails, appleCardTransactions, platformSettings, tasks, flightBookings, utilityBills, utilityBillers, airtimePurchases, linkedServices, financialAnalysis, isAnalyzing, analysisError, internalAccounts, addNotification, onOpenSendMoneyFlow, cryptoPortfolioValue, portfolioChange24h, totalNetWorth, createWireTransaction, handleToggleSubscriptionAutopay, handleToggleUtilityAutopay]);

  if (authState === 'intro') {
    return <AdvancedFirstPage onComplete={() => setAuthState('profile_signin')} />;
  }

  if (authState === 'profile_signin') {
      return <Welcome onLogin={handleLogin} onStartCreateAccount={() => setAuthState('account_creation')} />;
  }
  
  if (authState === 'account_creation') {
      return <AccountCreationFlow onBackToLogin={() => setAuthState('profile_signin')} onCreateAccountSuccess={handleCreateAccount} />;
  }

  if (authState === 'opening') {
      return <OpeningSequence onComplete={() => setAuthState('logged_in')} />;
  }

  if (authState === 'logging_out') {
      return <LoggingOut onComplete={handleFinalLogout} />;
  }
  
  if (authState === 'logged_out') {
      return <LoggedOut user={userProfile} onLogin={() => setAuthState('profile_signin')} onSwitchUser={handleSwitchUser} />;
  }

  return (
    <div className="min-h-screen">
      <Header 
        onMenuToggle={() => setIsMenuOpen(prev => !prev)}
        isMenuOpen={isMenuOpen}
        activeView={activeView}
        setActiveView={handleSetActiveView}
        onLogout={() => setShowLogoutConfirm(true)}
        notifications={notifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onNotificationClick={handleSetActiveView}
        userProfile={userProfile}
        onOpenLanguageSelector={() => setIsLanguageSelectorOpen(true)}
      />
      <main className={`transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-16 sm:translate-x-72' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {mainContent}
          </div>
      </main>
      <Footer setActiveView={setActiveView} />

      {/* Modals and Overlays */}
      {isSendMoneyFlowOpen && <SendMoneyFlow onDepositCheck={() => {}} onSplitTransaction={() => true} initialTab={initialSendMoneyTab} onContactSupport={() => setIsContactSupportModalOpen(true)} onPayFee={handleOpenFeePayment} recipients={recipients} accounts={accounts} createTransaction={createTransaction} transactions={transactions} securitySettings={securitySettings} hapticsEnabled={platformSettings.hapticsEnabled} onAuthorizeTransaction={handleAuthorizeTransaction} setActiveView={setActiveView} onClose={() => setIsSendMoneyFlowOpen(false)} onLinkAccount={() => setIsLinkAccountModalOpen(true)} userProfile={userProfile} exchangeRates={exchangeRates} />}
      {isAddRecipientModalOpen && <AddRecipientModal onClose={() => setIsAddRecipientModalOpen(false)} onAddRecipient={addRecipient} recipientToEdit={recipientToEdit} onUpdateRecipient={onUpdateRecipient} recipients={recipients} />}
      {isChangePasswordModalOpen && <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} onSuccess={() => addNotification(NotificationType.SECURITY, 'Password Changed', 'Your password has been successfully updated.')}/>}
      {isContactSupportModalOpen && <ContactSupportModal onClose={() => setIsContactSupportModalOpen(false)} onSubmit={handleSupportSubmit} transactions={transactions} />}
      {isLanguageSelectorOpen && <LanguageSelector onClose={() => setIsLanguageSelectorOpen(false)} />}
      {feePaymentState.isOpen && feePaymentState.transaction && <FeePaymentModal transaction={feePaymentState.transaction} accounts={internalAccounts} onClose={() => setFeePaymentState({isOpen: false, transaction: null})} onConfirm={handleFeePayment} />}
      {showLogoutConfirm && <LogoutConfirmationModal onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />}
      {isInactive && <InactivityModal onStayLoggedIn={() => setIsInactive(false)} onLogout={handleLogout} countdownStart={60} />}
      {ongoingTransaction && <DynamicIslandSimulator transaction={ongoingTransaction} />}
      {pushNotifications.length > 0 && <PushNotificationToast notification={pushNotifications[0]} onClose={() => setPushNotifications(prev => prev.slice(1))} />}
      {savedSession && <ResumeSessionModal session={savedSession} onResume={() => { setActiveView(savedSession.view); setSavedSession(null); }} onStartFresh={() => setSavedSession(null)} />}
      {isLinkAccountModalOpen && <LinkBankAccountModal onClose={() => setIsLinkAccountModalOpen(false)} onLinkSuccess={handleLinkAccountSuccess} />}
      <BankingChat userProfile={userProfile} />

    </div>
  );
}

const App = () => (
    <LanguageProvider>
        <AppComponent />
    </LanguageProvider>
);
export default App;
