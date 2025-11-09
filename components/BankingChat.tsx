import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startChatSession } from '../services/geminiService';
import { SendIcon, SpinnerIcon, XIcon, ChatBubbleLeftRightIcon, MicrophoneIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import type { Chat } from '@google/genai';

// @ts-ignore
// FIX: Renamed constant to avoid shadowing the global SpeechRecognition type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;


interface Message {
    role: 'user' | 'model';
    text: string;
}

interface BankingChatProps {
    userProfile: UserProfile;
}

type ChatLanguage = 'en' | 'es' | 'fr';

const languageMap: Record<ChatLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French'
};

const ASSISTANT_AVATAR = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600';

const VoiceCommandModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    transcript: string;
    isListeningActive: boolean;
}> = ({ isOpen, onClose, transcript, isListeningActive }) => {
    if (!isOpen) return null;
    const { t } = useLanguage();

    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg rounded-2xl flex flex-col items-center justify-center z-20 animate-fade-in">
            <div className={`relative w-24 h-24 flex items-center justify-center mb-6`}>
                <div className={`absolute inset-0 bg-primary/20 rounded-full ${isListeningActive ? 'animate-ping' : ''}`}></div>
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <MicrophoneIcon className="w-10 h-10 text-white" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{isListeningActive ? t('chat_listening') : t('chat_speak_now')}</h3>
            <p className="mt-2 text-slate-300 h-12">{transcript || '...'}</p>
            <button onClick={onClose} className="mt-6 text-sm text-slate-400 hover:text-white">
                Cancel
            </button>
        </div>
    );
};


export const BankingChat: React.FC<BankingChatProps> = ({ userProfile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatLanguage, setChatLanguage] = useState<ChatLanguage>('en');
    const { t } = useLanguage();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isListeningActive, setIsListeningActive] = useState(false);
    // FIX: Changed SpeechRecognition type to any to avoid TS errors with browser-specific APIs.
    const recognitionRef = useRef<any | null>(null);

    // Initialize/reset chat when language or 't' function changes
    useEffect(() => {
        chatRef.current = startChatSession(languageMap[chatLanguage]);
        setMessages([{ role: 'model', text: t('chat_initial_message') }]);
    }, [t, chatLanguage]);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);
    
    const handleSend = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const chat = chatRef.current;
        if (!chat) return;

        const userMessageText = input;
        const userMessage: Message = { role: 'user', text: userMessageText };
        
        // Add user message and a placeholder for model's response
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: userMessageText });

            for await (const chunk of stream) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.text += chunk.text;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error with chat stream:", error);
            const errorText = "Sorry, I encountered an error. Please try again.";
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                 if (lastMessage.role === 'model' && lastMessage.text === '') {
                    lastMessage.text = errorText;
                } else {
                    newMessages.push({ role: 'model', text: errorText });
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chatLanguage, t]);

    const handleVoiceCommand = () => {
        // FIX: The `SpeechRecognition` global was being used directly, which can cause issues. Now using the `SpeechRecognitionAPI` compatibility constant defined at the top of the file.
        if (!SpeechRecognitionAPI) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        // FIX: Use the SpeechRecognitionAPI compatibility constant to correctly instantiate the SpeechRecognition object.
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        recognition.lang = chatLanguage;
        recognition.interimResults = true;
        recognition.continuous = false;
        
        recognition.onstart = () => {
            setIsListeningActive(true);
            setTranscript('');
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(interimTranscript || finalTranscript);
            if (finalTranscript) {
                setInput(finalTranscript);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setIsListeningActive(false);
            recognitionRef.current = null;
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            setIsListeningActive(false);
            recognitionRef.current = null;
             if (event.error === 'not-allowed') {
                alert("Microphone permission was denied. Please enable it in your browser settings to use voice commands.");
            }
        };
        
        recognition.start();
        setIsListening(true);
    };


    return (
        <>
            <div className={`fixed bottom-6 right-6 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Open chat assistant"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                </button>
            </div>

            <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm h-full max-h-[70vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">{t('chat_assistant_title')}</h3>
                        <div className="flex items-center space-x-2">
                             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400 font-semibold">{t('chat_online')}</span>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <select 
                            id="chat-lang-select" 
                            value={chatLanguage} 
                            onChange={(e) => setChatLanguage(e.target.value as ChatLanguage)}
                            className="bg-slate-700/50 border-0 focus:ring-1 focus:ring-primary-500 text-slate-300 text-xs rounded-md p-1"
                            aria-label={t('chat_language_select')}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                        </select>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
                            <XIcon className="w-5 h-5" />
                        </button>
                     </div>
                </div>
                
                 <div className="relative flex-grow">
                    <VoiceCommandModal 
                        isOpen={isListening} 
                        onClose={() => {
                            if (recognitionRef.current) {
                                recognitionRef.current.stop();
                            }
                        }}
                        transcript={transcript}
                        isListeningActive={isListeningActive}
                    />

                    {/* Messages */}
                    <div ref={chatContainerRef} className="absolute inset-0 p-4 space-y-4 overflow-y-auto bg-slate-800/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && (
                                    <img src={ASSISTANT_AVATAR} alt="iCU Assist" className="w-8 h-8 rounded-full flex-shrink-0" />
                                )}
                                
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    <p className="text-sm break-words">{msg.text}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <img src={userProfile.profilePictureUrl} alt="You" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                )}
                            </div>
                        ))}
                        {isLoading && messages[messages.length-1]?.role !== 'model' && (
                            <div className="flex items-end gap-3">
                                <img src={ASSISTANT_AVATAR} alt="iCU Assist" className="w-8 h-8 rounded-full flex-shrink-0" />
                                <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-700 text-slate-400 rounded-bl-none">
                                <p className="text-sm italic">{t('chat_typing')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chat_placeholder')}
                            className="w-full bg-slate-700 border border-slate-600 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                         <button type="button" onClick={handleVoiceCommand} className={`p-3 rounded-lg shadow-md transition-colors ${isListeningActive ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`} aria-label={t('chat_voice_command')}>
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-primary-500 text-white rounded-lg shadow-md disabled:bg-primary-400/50" aria-label="Send message">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
