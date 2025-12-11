import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle2, Circle, Clock, ArrowUpDown, Upload, Trophy, Medal, Award, FileDown, Download } from 'lucide-react';
import Papa from 'papaparse';
import DashboardCharts from './DashboardCharts';

const DashboardView = () => {
    const { applications, reviews, getReviewStatus, isLoading } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'reviewed', 'in_progress', 'not_started'
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });



    // --- Helper: Calculate Score ---
    const getScore = (id) => {
        const review = reviews[id];
        if (!review) return 0;
        const motivation = Number(review.motivation || 0);
        const academic = Number(review.academic || 0);
        const presentation = Number(review.presentation || 0);
        const fit = Number(review.fit || 0);
        return motivation + academic + presentation + fit;
    };

    // --- Derived Data: Applications with Scores & Ranks ---
    const processedApplications = useMemo(() => {
        // 1. Attach scores
        const withScores = applications.map(app => ({
            ...app,
            score: getScore(app.id),
            status: getReviewStatus(app.id)
        }));

        // 2. Sort by score desc to determine rank
        const ranked = [...withScores].sort((a, b) => b.score - a.score);

        // 3. Attach rank
        return ranked.map((app, index) => ({
            ...app,
            rank: index + 1
        }));
    }, [applications, reviews, getReviewStatus]);

    const stats = useMemo(() => {
        const total = applications.length;
        const reviewed = applications.filter(app => getReviewStatus(app.id) === 'reviewed').length;
        const pending = total - reviewed;
        return { total, reviewed, pending };
    }, [applications, getReviewStatus]);

    const filteredApplications = useMemo(() => {
        let filtered = [...processedApplications];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
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
    }, [processedApplications, searchTerm, statusFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExportCSV = () => {
        const exportData = processedApplications.map((app) => ({
            Rank: app.rank,
            Name: app.name,
            Email: app.email,
            University: app.university,
            Destination: `${app.destinationCity}, ${app.destinationCountry}`,
            Score: app.score,
            Status: app.status,
            'Motivation Score': reviews[app.id]?.motivation || 0,
            'Academic Score': reviews[app.id]?.academic || 0,
            'Presentation Score': reviews[app.id]?.presentation || 0,
            'Fit Score': reviews[app.id]?.fit || 0,
            'Documents Complete': reviews[app.id]?.documentsComplete ? 'Yes' : 'No',
            Notes: (reviews[app.id]?.comments || []).map(c => c.text).join('; ')
        }));

        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'scholarship_ranking.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'reviewed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'rgba(122, 193, 67, 0.1)', color: '#5a9632', borderColor: 'rgba(122, 193, 67, 0.3)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'rgba(244, 123, 32, 0.1)', color: '#c4620f', borderColor: 'rgba(244, 123, 32, 0.3)' }}>
                        <Clock className="w-3.5 h-3.5" /> In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <Circle className="w-3.5 h-3.5" /> Pending
                    </span>
                );
        }
    };

    const RankIcon = ({ rank }) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-sm" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 drop-shadow-sm" />;
        if (rank === 3) return <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />;
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    };







    return (
        <div className="space-y-8">
            {/* Charts & Stats Section */}
            <DashboardCharts applications={applications} stats={stats} />

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors" style={{ '--tw-text-opacity': 1 }} />
                    <input
                        type="text"
                        placeholder="Search candidates, universities..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto p-1 items-center">
                    <div className="relative">
                        <select
                            className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 ml-2"
                    >
                        <FileDown className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 w-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('rank')}>
                                    <div className="flex items-center justify-center gap-2">Rank <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('university')}>
                                    <div className="flex items-center gap-2">University <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('destinationCountry')}>
                                    <div className="flex items-center gap-2">Destination <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('score')}>
                                    <div className="flex items-center justify-center gap-2">Score <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredApplications.map((app) => (
                                <tr
                                    key={app.id}
                                    onClick={() => navigate(`/review/${app.id}`)}
                                    className="hover:bg-gray-100/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <RankIcon rank={app.rank} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(46, 49, 146, 0.1)', color: '#2e3192' }}>
                                                {app.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-gray-900">{app.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{app.university}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {app.destinationCity}, <span className="text-gray-400">{app.destinationCountry}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-bold tabular-nums tracking-tight" style={{ color: app.score >= 75 ? '#7ac143' : app.score >= 50 ? '#2e3192' : '#f47b20' }}>{app.score}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={app.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredApplications.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
