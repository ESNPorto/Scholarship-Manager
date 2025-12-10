import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileDown, Trophy } from 'lucide-react';
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Final Ranking</h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <FileDown className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm opacity-50 cursor-not-allowed"
                        title="PDF Export coming soon"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-16 text-center">Rank</th>
                                <th className="px-6 py-4">Candidate</th>
                                <th className="px-6 py-4">University</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rankedApplications.map((app, index) => (
                                <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-yellow-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {app.name}
                                        {index === 0 && <Trophy className="inline-block w-4 h-4 text-yellow-500 ml-2" />}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{app.university}</td>
                                    <td className="px-6 py-4 text-gray-600">{app.destinationCountry}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-gray-900">{app.score}</span>
                                        <span className="text-gray-400 text-xs">/100</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                                                app.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-500'
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
