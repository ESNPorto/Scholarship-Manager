import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileDown, Trophy, Medal, Award } from 'lucide-react';
import Papa from 'papaparse';

const SummaryView = () => {
    const { applications, reviews, getReviewStatus } = useApp();

    const getScore = (id) => {
        const review = reviews[id];
        if (!review) return 0;
        const motivation = parseInt(review.motivation || 0);
        const academic = parseInt(review.academic || 0);
        const presentation = parseInt(review.presentation || 0);
        const fit = parseInt(review.fit || 0);
        return motivation + academic + presentation + fit;
    };

    const rankedApplications = [...applications]
        .map(app => ({
            ...app,
            score: getScore(app.id),
            status: getReviewStatus(app.id)
        }))
        .sort((a, b) => b.score - a.score);

    const handleExportCSV = () => {
        const exportData = rankedApplications.map((app, index) => ({
            Rank: index + 1,
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
            Notes: reviews[app.id]?.notes || ''
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

    const RankIcon = ({ rank }) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-sm" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 drop-shadow-sm" />;
        if (rank === 3) return <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />;
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Final Ranking</h2>
                    <p className="text-gray-500 text-sm mt-1">Overview of all candidates ordered by total score</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                    >
                        <FileDown className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold shadow-lg shadow-blue-600/20 opacity-50 cursor-not-allowed"
                        title="PDF Export coming soon"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 w-20 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">University</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination</th>
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rankedApplications.map((app, index) => (
                                <tr key={app.id} className={`hover:bg-gray-50/80 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50/10 to-transparent' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <RankIcon rank={index + 1} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{app.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{app.university}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {app.destinationCity}, <span className="text-gray-400">{app.destinationCountry}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-lg font-bold tabular-nums tracking-tight ${app.score >= 75 ? 'text-green-600' :
                                                    app.score >= 50 ? 'text-blue-600' :
                                                        'text-orange-500'
                                                }`}>{app.score}</span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Points</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === 'reviewed' ? 'bg-green-50 text-green-700 border-green-100' :
                                                app.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}>
                                            {app.status === 'reviewed' ? 'Reviewed' : app.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
