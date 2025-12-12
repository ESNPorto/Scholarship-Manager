import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle2, Circle, Clock, ArrowUpDown, Upload, Trophy, Medal, Award, FileDown, Download, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import DashboardCharts from './DashboardCharts';

import ReviewerBadges from './common/ReviewerBadges';
import ReviewSessionCard from './dashboard/ReviewSessionCard';
import Select from './common/Select';
import { getReviewerStatus } from '../utils/scoring';

const DashboardView = () => {
    const { applications, reviews, getReviewStatus, isLoading, userRole } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'reviewed', 'in_progress', 'not_started'
    const [viewFilter, setViewFilter] = useState('pending_me'); // 'pending_me', 'all', 'done_me'
    const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });




    // --- Derived Data: Applications with Scores & Ranks ---
    const processedApplications = useMemo(() => {
        // 1. Attach scores
        const withScores = applications.map(app => ({
            ...app,
            score: calculateScore(reviews[app.id]),
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

        // 0. Reviewer View Filters
        if (userRole) {
            if (viewFilter === 'pending_me') {
                filtered = filtered.filter(app => {
                    const review = reviews[app.id];
                    return !getReviewerStatus(review, userRole);
                });
            } else if (viewFilter === 'done_me') {
                filtered = filtered.filter(app => {
                    const review = reviews[app.id];
                    return getReviewerStatus(review, userRole);
                });
            }
        }

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
        // Sort
        filtered.sort((a, b) => {
            if (sortConfig.key === 'status') {
                const statusPriority = { reviewed: 3, in_progress: 2, not_started: 1, discarded: 0 };
                const valA = statusPriority[a.status] || 0;
                const valB = statusPriority[b.status] || 0;
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }

            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [processedApplications, searchTerm, statusFilter, viewFilter, sortConfig, userRole, reviews]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExportCSV = () => {
        const exportData = processedApplications.map((app) => {
            const review = reviews[app.id] || {};
            const motivation = review.motivation || {};
            const presentation = review.presentation || {};

            const getAvg = (obj) => {
                if (typeof obj === 'number') return obj;
                if (!obj) return 0;
                return ((obj.president || 0) + (obj.eo || 0) + (obj.cf || 0)) / 3;
            };

            return {
                Rank: app.rank,
                Name: app.name,
                Email: app.email,
                University: app.university,
                Destination: `${app.destinationCity}, ${app.destinationCountry}`,
                Score: app.score,
                Status: app.status,
                Valid: review.valid !== false ? 'Yes' : 'No',
                'Mot Avg': getAvg(motivation).toFixed(2),
                'Mot President': motivation.president || 0,
                'Mot EO': motivation.eo || 0,
                'Mot CF': motivation.cf || 0,
                'Pres Avg': getAvg(presentation).toFixed(2),
                'Pres President': presentation.president || 0,
                'Pres EO': presentation.eo || 0,
                'Pres CF': presentation.cf || 0,
                'Academic Score': review.academic || 0,
                'IRS Score': review.irs || 0,
                'Documents Complete': review.verifiedDocs && Object.values(review.verifiedDocs).filter(Boolean).length === 6 ? 'Yes' : 'No',
                Notes: (review.comments || []).map(c => c.text).join('; ')
            };
        });

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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-esn-green/10 text-esn-green border-esn-green/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-esn-orange/10 text-esn-orange border-esn-orange/30">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                    </span>
                );
            case 'discarded':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-500 border-red-500/30">
                        <Circle className="w-3.5 h-3.5 fill-current" /> Discarded
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
        if (rank === 1) return <Trophy className="w-5 h-5 text-gray-400 drop-shadow-sm" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 drop-shadow-sm" />;
        if (rank === 3) return <Award className="w-5 h-5 text-gray-400 drop-shadow-sm" />;
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    };







    return (
        <div className="space-y-8">
            {/* Charts & Stats Section */}
            <DashboardCharts applications={applications} stats={stats} />



            {/* Review Session Entry Point */}
            {userRole && (
                <ReviewSessionCard userRole={userRole} />
            )}

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors" style={{ '--tw-text-opacity': 1 }} />
                    <input
                        type="text"
                        placeholder="Search candidates, universities..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all text-sm font-medium text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto p-1 items-center justify-end">

                    {/* View Filter (My Pending / All) */}
                    {userRole && (
                        <Select
                            value={viewFilter}
                            onChange={(value) => setViewFilter(value)}
                            options={[
                                { value: 'pending_me', label: 'My Pending Reviews' },
                                { value: 'all', label: 'Broad Overview' },
                                { value: 'done_me', label: 'Completed by Me' }
                            ]}
                            className="w-full sm:w-auto min-w-[200px]"
                        />
                    )}

                    <Select
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'not_started', label: 'Not Started' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'reviewed', label: 'Reviewed' },
                            { value: 'discarded', label: 'Discarded' }
                        ]}
                        className="w-full sm:w-auto min-w-[180px]"
                    />

                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 ml-2"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden lg:inline">Export</span>
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
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Reviewers
                                </th>
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('status')}>
                                    <div className="flex items-center justify-center gap-2">Status <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
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
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-esn-dark-blue/10 text-esn-dark-blue">
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
                                        <span className={`text-lg font-bold tabular-nums tracking-tight ${app.score >= 15 ? 'text-esn-green' : app.score >= 10 ? 'text-esn-dark-blue' : 'text-esn-orange'}`}>{app.score}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <div className="scale-90">
                                                <ReviewerBadges
                                                    review={reviews[app.id]}
                                                    userRole={userRole}
                                                />
                                            </div>
                                        </div>
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
