import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';

import logo from '../assets/favicon.png';

const Layout = ({ children }) => {
    const { loadData } = useApp();
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);

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
