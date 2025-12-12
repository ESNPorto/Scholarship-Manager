import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext'; // Corrected path
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Layers } from 'lucide-react';

const ReviewSessionCard = ({ userRole }) => {
    const { applications, reviews, startReviewSession, reviewSession, jumpToApplication } = useApp();
    const navigate = useNavigate();

    // Calculate pending count logic (duplicated temporarily from context to show count before starting)
    // In a real refactor, we should extract getPendingApps(role) to a helper or context
    const pendingCount = useMemo(() => {
        if (!userRole || !applications.length) return 0;

        const reviewFieldMap = {
            'president': 'president',
            'eo': 'eo',
            'cf': 'cf'
        };

        return applications.filter(app => {
            const review = reviews[app.id] || {};
            if (review.status === 'discarded') return false;

            const hasScore = (section) => review[section] && review[section][userRole] !== undefined && review[section][userRole] !== '';
            const motivationDone = hasScore('motivation');
            const presentationDone = hasScore('presentation');

            return !(motivationDone && presentationDone);
        }).length;
    }, [applications, reviews, userRole]);

    const handleStartSession = () => {
        const firstAppId = startReviewSession(userRole);
        if (firstAppId) {
            navigate(`/review/${firstAppId}?reviewMode=true`);
        }
    };

    const handleResumeSession = () => {
        const appId = jumpToApplication(reviewSession.currentIndex);
        if (appId) {
            navigate(`/review/${appId}?reviewMode=true`);
        }
    };

    // If active session exists, show Resume
    if (reviewSession.isActive && reviewSession.role === userRole) {
        const currentInProgress = reviewSession.currentIndex + 1;
        const total = reviewSession.queue.length;

        return (
            <div className="bg-gradient-to-r from-esn-green to-emerald-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <Layers className="w-7 h-7 text-emerald-200" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Resume Session</h2>
                            <p className="text-emerald-100 font-medium opacity-90">
                                Resume application <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded text-sm">{currentInProgress}</span> of {total}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleResumeSession}
                        className="w-full sm:w-auto px-8 py-3.5 bg-white text-esn-green font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2.5 group/btn"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Resume Review
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    if (pendingCount === 0) return null;

    return (
        <div className="bg-gradient-to-r from-esn-dark-blue to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-esn-cyan/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Layers className="w-7 h-7 text-esn-cyan" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight mb-1">Review Session</h2>
                        <p className="text-blue-100 font-medium opacity-90">
                            You have <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded text-sm">{pendingCount}</span> applications pending your review.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleStartSession}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-esn-dark-blue font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2.5 group/btn"
                >
                    <Play className="w-5 h-5 fill-current" />
                    Start Session
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ReviewSessionCard;
