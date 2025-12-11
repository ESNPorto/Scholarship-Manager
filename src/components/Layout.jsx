import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Upload } from 'lucide-react';

const Layout = ({ children }) => {
    const { navigateToDashboard, loadData } = useApp();

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
                        onClick={navigateToDashboard}
                    >
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Scholarship Review</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 cursor-pointer transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95 text-sm font-medium">
                            <Upload className="w-4 h-4" />
                            Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 animate-in fade-in duration-500">
                {children}
            </main>
        </div>
    );
};

export default Layout;
