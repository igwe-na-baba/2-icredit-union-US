import React, { useState, useEffect, useRef } from 'react';
import { 
    MenuIcon, LogoutIcon, BellIcon, CogIcon, QuestionMarkCircleIcon, GlobeAmericasIcon, UserCircleIcon
} from './Icons';
import { Notification, View, UserProfile } from '../types';
import { MegaMenu } from './MegaMenu';
import { NotificationsPanel } from './NotificationsPanel';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onNotificationClick: (view: View) => void;
  userProfile: UserProfile;
  onOpenLanguageSelector: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, activeView, setActiveView, onLogout, notifications, onMarkNotificationsAsRead, onNotificationClick, userProfile, onOpenLanguageSelector }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
      setShowNotifications(prev => !prev);
      if (!showNotifications) {
          onMarkNotificationsAsRead();
      }
  }

  const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  }

  useOutsideAlerter(notificationsRef, () => setShowNotifications(false));
  useOutsideAlerter(profileRef, () => setIsProfileOpen(false));

  const handleProfileNav = (view: View) => {
      setActiveView(view);
      setIsProfileOpen(false);
  }

  const handleLogoutClick = () => {
      onLogout();
      setIsProfileOpen(false);
  }

  return (
    <>
      <header className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Left side: Menu and Title */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onMenuToggle}
                        className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white hidden sm:block">{t(`header_title_${activeView}`)}</h1>
                </div>
                
                {/* Right side actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onOpenLanguageSelector}
                        className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Select language"
                    >
                        <GlobeAmericasIcon className="w-6 h-6" />
                    </button>
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={toggleNotifications}
                            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="View notifications"
                        >
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onNotificationClick={onNotificationClick} />}
                    </div>
                    
                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(prev => !prev)}
                            className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary"
                            aria-label="Open user menu"
                            aria-haspopup="true"
                            aria-expanded={isProfileOpen}
                            id="user-menu-button"
                        >
                            <img src={userProfile.profilePictureUrl} alt="User Profile" className="w-10 h-10 rounded-full" />
                        </button>

                        {isProfileOpen && (
                            <div
                                className="absolute top-full right-0 mt-2 w-64 bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 z-50 animate-scale-in-tr"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                            >
                                <div className="p-4 border-b border-white/10">
                                    <p className="font-bold text-slate-100 truncate">{userProfile.name}</p>
                                    <p className="text-sm text-slate-400 truncate">{userProfile.email}</p>
                                </div>
                                <div className="p-2" role="none">
                                    <button
                                        onClick={() => handleProfileNav('accounts')}
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-200 hover:bg-white/5 transition-colors"
                                        role="menuitem"
                                    >
                                        <UserCircleIcon className="w-5 h-5 text-slate-400" />
                                        <span>My Account</span>
                                    </button>
                                    <button
                                        onClick={() => handleProfileNav('security')}
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-200 hover:bg-white/5 transition-colors"
                                        role="menuitem"
                                    >
                                        <CogIcon className="w-5 h-5 text-slate-400" />
                                        <span>Settings</span>
                                    </button>
                                    <button
                                        onClick={() => handleProfileNav('support')}
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-200 hover:bg-white/5 transition-colors"
                                        role="menuitem"
                                    >
                                        <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400" />
                                        <span>Support</span>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-white/10" role="none">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-colors"
                                        role="menuitem"
                                    >
                                        <LogoutIcon className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </header>
      <MegaMenu
        isOpen={isMenuOpen}
        onClose={onMenuToggle}
        activeView={activeView}
        setActiveView={setActiveView}
        userProfile={userProfile}
      />
    </>
  );
};