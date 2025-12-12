import React, { useMemo } from 'react';
import { getReviewerStatus } from '../../utils/scoring';
import { CheckCircle2, Circle } from 'lucide-react';

const ProgressCard = ({ applications, reviews, userRole }) => {

    const progress = useMemo(() => {
        if (!userRole) return null;

        const total = applications.length;
        if (total === 0) return { reviewed: 0, pending: 0, percentage: 0 };

        const reviewedCount = applications.filter(app => {
            const review = reviews[app.id];
            return getReviewerStatus(review, userRole);
        }).length;

        const percentage = Math.round((reviewedCount / total) * 100);

        return {
            reviewed: reviewedCount,
            pending: total - reviewedCount,
            total,
            percentage
        };

    }, [applications, reviews, userRole]);

    if (!userRole || !progress) return null;

    const roleLabels = {
        president: 'President',
        eo: 'External Officer',
        cf: 'Fiscal Council'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Your Progress
                        <span className="px-2 py-0.5 rounded-full bg-esn-dark-blue/10 text-esn-dark-blue text-xs font-bold uppercase tracking-wide">
                            {roleLabels[userRole] || userRole}
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        You have reviewed <span className="font-semibold text-gray-900">{progress.reviewed}</span> out of <span className="font-semibold text-gray-900">{progress.total}</span> applications.
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <span className="text-3xl font-bold text-esn-dark-blue">{progress.percentage}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-esn-green transition-all duration-1000 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                />
            </div>

            <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
                <span>0%</span>
                <span className="sm:hidden">{progress.percentage}%</span>
                <span>100%</span>
            </div>

            {progress.pending === 0 && progress.total > 0 && (
                <div className="mt-4 p-3 bg-esn-green/10 text-esn-green rounded-xl flex items-center gap-2 text-sm font-medium animate-in zoom-in">
                    <CheckCircle2 className="w-5 h-5" />
                    All caught up! You have no pending reviews.
                </div>
            )}
        </div>
    );
};

export default ProgressCard;
