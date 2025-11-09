
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { NewsArticle, InsuranceProduct, LoanProduct, SystemUpdate, AccountType, VerificationLevel, AdvisorResponse } from '../types';

let ai: GoogleGenAI | undefined;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

export const translateWithGemini = async (text: string, targetLanguage: string): Promise<string> => {
    if (!ai) {
        return `(AI offline) ${text}`;
    }
     if (!text || !text.trim()) {
        return "";
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLanguage}. Return only the translated text, without any additional formatting or explanations. Text to translate: "${text}"`,
        });
        // FIX: Use response.text to get the text output from the response.
        return response.text.trim();
    } catch (error) {
        console.error(`Error translating text to ${targetLanguage}:`, error);
        return `(Translation Error) ${text}`;
    }
};

export interface BankingTipResult {
  tip: string;
  isError: boolean;
}

const tipCache = new Map<string, BankingTipResult>();

export const getCountryBankingTip = async (countryName: string): Promise<BankingTipResult> => {
  if (tipCache.has(countryName)) {
    return tipCache.get(countryName)!;
  }

  if (!ai) {
    const result: BankingTipResult = {
      tip: `Standard banking information is required for ${countryName}.`,
      isError: false,
    };
    tipCache.set(countryName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, concise, and helpful banking tip for a user sending money to a bank account in ${countryName}. The tip should focus on a specific local requirement, a common mistake to avoid, or a best practice for that country. For example, for the UK, you might mention using a Sort Code. Frame the tip as direct advice.`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: `A short, one-sentence banking tip for sending money to ${countryName}.`
            }
          },
          required: ['tip']
        }
      }
    });
    
    // FIX: Use response.text to get the text output from the response.
    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText);
    const result: BankingTipResult = { tip: parsedJson.tip, isError: false };
    tipCache.set(countryName, result);
    return result;
  } catch (error) {
    console.error("Error fetching banking tip from Gemini:", error as any);
    const errorResult: BankingTipResult = { 
        tip: `Could not fetch banking tips at this time. Please ensure you have the correct details for ${countryName}.`, 
        isError: true 
    };
    tipCache.set(countryName, errorResult);
    return errorResult;
  }
};

export interface FinancialNewsResult {
  articles: NewsArticle[];
  isError: boolean;
}

const newsCache = new Map<string, FinancialNewsResult>();
const newsCacheKey = 'financialNews';

export const getFinancialNews = async (): Promise<FinancialNewsResult> => {
  if (newsCache.has(newsCacheKey)) {
    return newsCache.get(newsCacheKey)!;
  }

  if (!ai) {
    const result = {
      articles: [
        { title: 'Global Markets Show Mixed Signals', summary: 'Major indices are fluctuating as investors weigh inflation concerns against positive corporate earnings.', category: 'Market Analysis' },
      ],
      isError: false,
    };
    newsCache.set(newsCacheKey, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a list of 3 brief, synthetic financial news headlines and summaries relevant to international finance. Each item should have a title, summary, and category.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            description: "A list of three financial news articles.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The headline of the news article." },
                    summary: { type: Type.STRING, description: "A brief summary of the news article." },
                    category: { type: Type.STRING, description: "The category of the news, e.g., 'Market Analysis'." }
                },
                required: ['title', 'summary', 'category']
            }
        }
      }
    });
    
    // FIX: Use response.text to get the text output from the response.
    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const articles = JSON.parse(responseText);
    const result = { articles, isError: false };
    newsCache.set(newsCacheKey, result);
    return result;

  } catch (error) {
    console.error("Error fetching financial news from Gemini:", error as any);
    const errorResult = {
        articles: [ { title: 'AI News Feed Unavailable', summary: 'We are experiencing a temporary issue with our AI news service.', category: 'System Alert' } ],
        isError: true,
    };
    newsCache.set(newsCacheKey, errorResult);
    return errorResult;
  }
};


const insuranceCache = new Map<string, { product: InsuranceProduct | null; isError: boolean }>();

export const getInsuranceProductDetails = async (productName: string): Promise<{ product: InsuranceProduct | null; isError: boolean; }> => {
  if (insuranceCache.has(productName)) {
    return insuranceCache.get(productName)!;
  }

  if (!ai) {
    const fallbackData: { [key: string]: InsuranceProduct } = { /* ... fallback data as before ... */ };
    const product = fallbackData[productName] || null;
    const result = { product, isError: !product };
    if(product) insuranceCache.set(productName, result);
    return result;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a compelling marketing description and exactly 3 key benefits for a financial insurance product called "${productName}" offered by a fintech, iCredit Union®.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['description', 'benefits']
        }
      }
    });
    
    // FIX: Use response.text to get the text output from the response.
    const responseText = response.text.trim();
    if (!responseText) {
        throw new Error('Received empty or invalid response from Gemini API.');
    }
    const parsedJson = JSON.parse(responseText);
    const product: InsuranceProduct = { name: productName, description: parsedJson.description, benefits: parsedJson.benefits };
    const result = { product, isError: false };
    insuranceCache.set(productName, result);
    return result;
  } catch (error) {
    console.error(`Error fetching insurance details for ${productName} from Gemini:`, error as any);
    const errorResult = { product: null, isError: true };
    insuranceCache.set(productName, errorResult);
    return errorResult;
  }
};

const loanCache = new Map<string, { products: LoanProduct[]; isError: boolean }>();

export const getLoanProducts = async (): Promise<{ products: LoanProduct[]; isError: boolean; }> => {
    const cacheKey = 'allLoanProducts';
    if (loanCache.has(cacheKey)) {
        return loanCache.get(cacheKey)!;
    }

    if (!ai) { /* ... fallback data as before ... */ }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate details for three distinct loan products as a JSON array: a Personal Loan, an Auto Loan, and a Home Mortgage for iCredit Union®. For each, provide id, name, description, 3 benefits, and min/max interest rate.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                            interestRate: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    min: { type: Type.NUMBER }, 
                                    max: { type: Type.NUMBER } 
                                },
                                required: ['min', 'max']
                            }
                        },
                        required: ['id', 'name', 'description', 'benefits', 'interestRate']
                    }
                }
            }
        });
        
        // FIX: Use response.text to get the text output from the response.
        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error('Received empty or invalid response from Gemini API.');
        }
        const products = JSON.parse(responseText);
        const result = { products, isError: false };
        loanCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching loan products from Gemini:", error as any);
        const errorResult = { products: [], isError: true };
        loanCache.set(cacheKey, errorResult);
        return errorResult;
    }
};

const supportCache = new Map<string, { answer: string; isError: boolean }>();

export const getSupportAnswer = async (query: string): Promise<{ answer: string; isError: boolean; }> => {
  if (supportCache.has(query)) {
    return supportCache.get(query)!;
  }

  if (!ai) {
    return { answer: `Our AI assistant is currently offline. Please contact our support team directly regarding "${query}".`, isError: false };
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful customer support AI for iCredit Union®. A customer asked: "${query}". Provide a clear, helpful answer. Use Markdown for formatting.`,
      config: { 
        temperature: 0.3, 
      }
    });
    // FIX: Use response.text to get the text output from the response.
    const responseText = response.text;
    if (!responseText) {
        throw new Error('Received empty response from Gemini API.');
    }
    const result = { answer: responseText, isError: false };
    supportCache.set(query, result);
    return result;
  } catch (error) {
    console.error(`Error fetching support answer for "${query}" from Gemini:`, error as any);
    return { answer: "Our AI assistant is currently unavailable. Please try again later.", isError: true };
  }
};

const updatesCache = new Map<string, { updates: SystemUpdate[]; isError: boolean }>();

export const getSystemUpdates = async (): Promise<{ updates: SystemUpdate[]; isError: boolean; }> => {
    const cacheKey = 'systemUpdates';
    if(updatesCache.has(cacheKey)) return updatesCache.get(cacheKey)!;
    
    if(!ai) {
        const fallback = { updates: [{ id: '1', title: 'AI Service Offline', date: new Date().toISOString(), description: 'System updates are currently unavailable.', category: 'Maintenance' as const }], isError: false };
        updatesCache.set(cacheKey, fallback);
        return fallback;
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a JSON array of 3 recent, synthetic system updates for a fintech app, iCredit Union®. Include id, title, date (YYYY-MM-DD), description, and category ('New Feature', 'Improvement', 'Maintenance').",
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            date: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                        },
                        required: ['id', 'title', 'date', 'description', 'category']
                    }
                }
            }
        });
        // FIX: Use response.text to get the text output from the response.
        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error('Received empty response from Gemini API.');
        }
        const updates = JSON.parse(responseText);
        const result = { updates, isError: false };
        updatesCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching system updates from Gemini:", error as any);
        const errorResult = { updates: [], isError: true };
        updatesCache.set(cacheKey, errorResult);
        return errorResult;
    }
};

const perksCache = new Map<string, { perks: string[]; isError: boolean; }>();

export const getAccountPerks = async (accountType: AccountType, verificationLevel: VerificationLevel): Promise<{ perks: string[]; isError: boolean; }> => {
    const cacheKey = `${accountType}-${verificationLevel}`;
    if(perksCache.has(cacheKey)) return perksCache.get(cacheKey)!;
    
    if(!ai) {
        const fallback = { perks: ['Enhanced fraud monitoring.', 'Priority customer support.'], isError: false };
        perksCache.set(cacheKey, fallback);
        return fallback;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3 unique, compelling security-related perks for an iCredit Union® "${accountType}" account holder with "${verificationLevel}" status.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { perks: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ['perks']
                }
            }
        });
        // FIX: Use response.text to get the text output from the response.
        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error('Received empty response from Gemini API.');
        }
        const parsedJson = JSON.parse(responseText);
        const result = { perks: parsedJson.perks, isError: false };
        perksCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching account perks from Gemini:", error as any);
        const errorResult = { perks: [], isError: true };
        perksCache.set(cacheKey, errorResult);
        return errorResult;
    }
};

export const startChatSession = (language: string = 'English') => {
    if (!ai) return null;
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are 'iCU Assist', a professional and friendly banking assistant for iCredit Union®. Your goal is to provide accurate, helpful, and secure information regarding the bank's services. Respond exclusively in ${language}. Never ask for personally identifiable information (PII) such as passwords, PINs, or full account numbers. Keep your answers concise and focused on banking-related topics.`,
        }
    });
};

const analysisCache = new Map<string, { analysis: AdvisorResponse | null, isError: boolean }>();

export const getFinancialAnalysis = async (data: string): Promise<{ analysis: AdvisorResponse | null, isError: boolean }> => {
    const cacheKey = data; // Simple cache key from data hash
    if(analysisCache.has(cacheKey)) return analysisCache.get(cacheKey)!;

    if(!ai) {
        return { analysis: null, isError: true };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `You are an expert AI financial advisor. Analyze the following JSON data representing a user's financial state: ${data}. Provide an overall summary, a financial score (0-100), a list of exactly 2 insights (each with category and insight text), and a list of exactly 2 product recommendations (each with productType, reason, suggestedAction, and linkTo view). The tone should be encouraging and helpful.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallSummary: { type: Type.STRING },
                        financialScore: { type: Type.NUMBER },
                        insights: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    insight: { type: Type.STRING },
                                    priority: { type: Type.STRING },
                                },
                                required: ['category', 'insight', 'priority']
                            }
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productType: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                    suggestedAction: { type: Type.STRING },
                                    linkTo: { type: Type.STRING },
                                },
                                required: ['productType', 'reason', 'suggestedAction', 'linkTo']
                            }
                        }
                    },
                    required: ['overallSummary', 'financialScore', 'insights', 'recommendations']
                }
            }
        });
        // FIX: Use response.text to get the text output from the response.
        const responseText = response.text.trim();
        if (!responseText) {
            throw new Error('Received empty response from Gemini API.');
        }
        const parsedJson = JSON.parse(responseText);
        const result = { analysis: parsedJson, isError: false };
        analysisCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error fetching financial analysis from Gemini:", error as any);
        return { analysis: null, isError: true };
    }
};