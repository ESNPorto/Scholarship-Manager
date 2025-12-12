import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext'; // Corrected path
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { getReviewerStatus } from '../../utils/scoring';

const ReviewSessionCard = ({ userRole }) => {
    const { applications, reviews, startReviewSession, reviewSession, resumeSession } = useApp();
    const navigate = useNavigate();

    // Combined Logic: Calculate Progress & Pending Status
    const stats = useMemo(() => {
        if (!userRole || !applications.length) return null;

        const total = applications.length;
        const reviewedCount = applications.filter(app => {
            const review = reviews[app.id];
            return getReviewerStatus(review, userRole);
        }).length;

        const pendingCount = total - reviewedCount;
        const percentage = Math.round((reviewedCount / total) * 100);

        return { total, reviewedCount, pendingCount, percentage };
    }, [applications, reviews, userRole]);

    const handleStartSession = () => {
        const firstAppId = startReviewSession(userRole);
        if (firstAppId) {
            navigate(`/review/${firstAppId}?reviewMode=true`);
        }
    };

    const handleResumeSession = () => {
        const appId = resumeSession();
        if (appId && appId !== 'finished') {
            navigate(`/review/${appId}?reviewMode=true`);
        } else if (appId === 'finished') {
            alert("Session completed! No more pending applications found in this queue.");
        }
    };

    if (!stats) return null;

    const { total, reviewedCount, pendingCount, percentage } = stats;
    const isAllCaughtUp = pendingCount === 0;
    const hasActiveSession = reviewSession.isActive && reviewSession.role === userRole;

    // Role Label Helper
    const roleLabels = {
        president: 'President',
        eo: 'External Officer',
        cf: 'Fiscal Council'
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-1 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-6 sm:p-8">
                {/* Header Row: Title & Percentage */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Progress</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-esn-dark-blue/5 text-esn-dark-blue text-[10px] font-bold uppercase tracking-wide border border-esn-dark-blue/10">
                                {roleLabels[userRole] || userRole}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            You have reviewed <span className="text-gray-900 font-bold">{reviewedCount}</span> out of <span className="text-gray-900 font-bold">{total}</span> applications.
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-bold text-gray-900 tracking-tight">{percentage}%</span>
                    </div>
                </div>

                {/* Progress Bar - Full Width */}
                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mb-8">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-esn-green to-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Bottom Row: Context & Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 border-t border-gray-50">
                    {/* Status Context */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isAllCaughtUp ? 'bg-esn-green/10 text-esn-green' : hasActiveSession ? 'bg-gray-900 text-white' : 'bg-esn-dark-blue/5 text-esn-dark-blue'}`}>
                            {isAllCaughtUp ? <CheckCircle2 className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                        </div>
                        <div>
                            {isAllCaughtUp ? (
                                <>
                                    <h3 className="font-bold text-gray-900">All caught up!</h3>
                                    <p className="text-sm text-gray-500">Great job, you have no pending reviews.</p>
                                </>
                            ) : hasActiveSession ? (
                                <>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-gray-900">Session in Progress</h3>
                                        <span className="inline-block w-2 h-2 rounded-full bg-esn-green animate-pulse" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Ready to review the <span className="font-bold text-gray-800">next application</span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold text-gray-900">Ready to review?</h3>
                                    <p className="text-sm text-gray-500">{pendingCount} applications waiting for you.</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isAllCaughtUp && (
                        <button
                            onClick={hasActiveSession ? handleResumeSession : handleStartSession}
                            className={`relative w-full sm:w-auto group/btn flex items-center justify-center gap-3 px-8 py-3.5 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] ${hasActiveSession
                                ? 'bg-gray-900 text-white hover:bg-black'
                                : 'bg-esn-dark-blue text-white hover:bg-blue-900 hover:shadow-esn-dark-blue/25'
                                }`}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{hasActiveSession ? 'Resume Session' : 'Start Session'}</span>
                            <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSessionCard;
