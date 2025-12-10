import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, FileText, BarChart3, Upload } from 'lucide-react';

const Layout = ({ children }) => {
    const { view, navigateToDashboard, navigateToSummary, loadData } = useApp();

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadData(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={navigateToDashboard}>
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Scholarship Review</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={navigateToDashboard}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'dashboard' || view === 'review'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Applications
                                </div>
                            </button>
                            <button
                                onClick={navigateToSummary}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'summary'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Summary
                                </div>
                            </button>
                        </nav>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm font-medium">
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
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
