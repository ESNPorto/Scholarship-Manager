import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, LogOut } from 'lucide-react';

import logo from '../assets/favicon.png';

const Layout = ({ children }) => {
    const { loadData } = useApp();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadData(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <img src={logo} alt="Scholarship Manager Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200" />
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Scholarship Manager</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {currentUser && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                                >
                                    {currentUser.photoURL ? (
                                        <img
                                            src={currentUser.photoURL}
                                            alt="Profile"
                                            referrerPolicy="no-referrer"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {currentUser.email[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {currentUser.displayName?.split(' ')[0] || 'User'}
                                    </span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ESN Dark Blue Scroll Progress Strip */}
            <div className="fixed top-16 left-0 right-0 z-40 h-2 bg-gray-100">
                <div
                    className="h-full transition-all duration-150"
                    style={{
                        width: `${scrollProgress}%`,
                        backgroundColor: '#2e3192'
                    }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-in fade-in duration-500">
                {children}
            </main>
        </div>
    );
};

export default Layout;
