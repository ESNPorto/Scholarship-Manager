import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, SkipForward, CheckCircle } from 'lucide-react';

const ReviewBottomNav = ({ currentAppId }) => {
    const {
        reviewSession,
        nextApplication,
        previousApplication,
        endReviewSession,
        reviews,
        applications,
        jumpToApplication
    } = useApp();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Safety check
    if (!reviewSession || !reviewSession.isActive) return null;

    const { queue, currentIndex, stats } = reviewSession;

    // Handlers
    const handleNext = () => {
        const nextId = nextApplication();
        if (nextId === 'finished') {
            handleExit(true);
        } else if (nextId) {
            navigate(`/review/${nextId}?reviewMode=true`);
            scrollToTop();
        }
    };

    const handlePrevious = () => {
        const prevId = previousApplication();
        if (prevId) {
            navigate(`/review/${prevId}?reviewMode=true`);
            scrollToTop();
        }
    };

    const handleSkip = () => {
        // For MVP, Skip just moves next without validation
        // In future it might tag as 'skipped'
        handleNext();
    };

    const handleExit = (finished = false) => {
        if (finished) {
            endReviewSession();
        }
        // If not finished, we just navigate away. 
        // Logic in AppContext keeps reviewSession.isActive = true
        // Logic in AppContext useEffect saves to localStorage
        navigate('/');
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const progressPercentage = Math.round(((currentIndex) / queue.length) * 100);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
            {/* Progress Bar Top */}
            <div className="h-1.5 bg-gray-200">
                <div
                    className="h-full bg-esn-cyan transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            <div className="bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] px-4 py-3 sm:px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">

                    {/* Left: Exit & Previous */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleExit()}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Exit Review Session"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                ${currentIndex === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Previous</span>
                        </button>
                    </div>

                    {/* Center: Info */}
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Application {currentIndex + 1} of {queue.length}
                        </span>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            Review Mode Active
                        </div>
                    </div>

                    {/* Right: Skip & Next */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSkip}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all"
                        >
                            <SkipForward className="w-4 h-4" />
                            Skip
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-esn-dark-blue text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-900 hover:shadow-lg active:scale-95 transition-all"
                        >
                            {currentIndex === queue.length - 1 ? 'Finish' : 'Next'}
                            {currentIndex === queue.length - 1 ? <CheckCircle className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReviewBottomNav;
