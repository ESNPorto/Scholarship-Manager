import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, CheckCircle2, Circle, Clock, ArrowUpDown } from 'lucide-react';

const DashboardView = () => {
    const { applications, navigateToReview, getReviewStatus } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'reviewed', 'in_progress', 'not_started'
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const stats = useMemo(() => {
        const total = applications.length;
        const reviewed = applications.filter(app => getReviewStatus(app.id) === 'reviewed').length;
        const pending = total - reviewed;
        return { total, reviewed, pending };
    }, [applications, getReviewStatus]);

    const filteredApplications = useMemo(() => {
        let filtered = [...applications];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => getReviewStatus(app.id) === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.name.toLowerCase().includes(lowerTerm) ||
                app.university.toLowerCase().includes(lowerTerm) ||
                app.destinationCity.toLowerCase().includes(lowerTerm) ||
                app.destinationCountry.toLowerCase().includes(lowerTerm)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [applications, searchTerm, statusFilter, sortConfig, getReviewStatus]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'reviewed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in_progress': return <Clock className="w-5 h-5 text-yellow-500" />;
            default: return <Circle className="w-5 h-5 text-red-400" />;
        }
    };

    if (applications.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="bg-white p-8 rounded-2xl shadow-sm inline-block max-w-md">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Applications Loaded</h2>
                    <p className="text-gray-500 mb-6">Upload a CSV file to start reviewing applications.</p>
                    {/* Upload button is in Layout, so just a hint here */}
                    <p className="text-sm text-gray-400">Use the "Import CSV" button in the top right.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium mb-1">Total Applications</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium mb-1">Reviewed</div>
                    <div className="text-3xl font-bold text-green-600">{stats.reviewed}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500 font-medium mb-1">Pending</div>
                    <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search candidates, universities..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('university')}>
                                    <div className="flex items-center gap-1">University <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('destinationCountry')}>
                                    <div className="flex items-center gap-1">Destination <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-900">{app.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{app.university}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {app.destinationCity}, {app.destinationCountry}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        <StatusIcon status={getReviewStatus(app.id)} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigateToReview(app.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredApplications.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No applications match your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper for empty state icon
import { Upload } from 'lucide-react';

export default DashboardView;
