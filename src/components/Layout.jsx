import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Upload, LogOut, ChevronDown, Check, UserCog, Shield } from 'lucide-react';

import logo from '../assets/favicon.png';

const Layout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const { editions, currentEditionId, switchEdition, userRole, setUserRole } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'profile' | 'edition' | null

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

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);



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
                        {/* Edition Selector */}
                        {editions.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown === 'edition' ? null : 'edition');
                                    }}
                                    className="flex items-center gap-2 hover:bg-gray-50 py-1.5 px-3 rounded-full border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                                >
                                    <span className="text-sm text-gray-500">Edition:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {editions.find(e => e.id === currentEditionId)?.name || 'Select Edition'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${activeDropdown === 'edition' ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === 'edition' && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Select Edition</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {editions.map(edition => (
                                                <button
                                                    key={edition.id}
                                                    onClick={() => {
                                                        switchEdition(edition.id);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between group transition-colors ${currentEditionId === edition.id
                                                        ? 'bg-esn-dark-blue/5 text-esn-dark-blue font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span>{edition.name}</span>
                                                    {currentEditionId === edition.id && (
                                                        <Check className="w-4 h-4 text-esn-dark-blue" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentUser && (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown === 'profile' ? null : 'profile');
                                    }}
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
                                        <div className="w-8 h-8 rounded-full bg-esn-dark-blue/10 flex items-center justify-center text-esn-dark-blue font-bold">
                                            {currentUser.email[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {currentUser.displayName?.split(' ')[0] || 'User'}
                                    </span>
                                </button>

                                {activeDropdown === 'profile' && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                        </div>

                                        {/* Role Selector */}
                                        <div className="p-2 border-b border-gray-100">
                                            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Your Role</p>
                                            {[
                                                { id: 'president', label: 'President', color: 'bg-green-100' },
                                                { id: 'eo', label: 'External Officer', color: 'bg-blue-100' },
                                                { id: 'cf', label: 'Fiscal Council', color: 'bg-orange-100' }
                                            ].map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => setUserRole(userRole === role.id ? null : role.id)}
                                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center justify-between transition-colors ${userRole === role.id
                                                        ? 'bg-esn-dark-blue/5 text-esn-dark-blue font-medium'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span>{role.label}</span>
                                                    {userRole === role.id && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigate('/import');
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Import Manager
                                        </button>
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

            {/* ESN Dark Blue Scroll Progress Strip - Hidden on Review Page */}
            {!location.pathname.includes('/review/') && (
                <div className="fixed top-16 left-0 right-0 z-40 h-2 bg-gray-100">
                    <div
                        className="h-full transition-all duration-150 bg-esn-dark-blue"
                        style={{
                            width: `${scrollProgress}%`
                        }}
                    />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-in fade-in duration-500">
                {children}
            </main>
        </div>
    );
};

export default Layout;
