import React from 'react';
import { getReviewerStatus } from '../../utils/scoring';

const ReviewerBadges = ({ review, userRole }) => {
    // Roles definition
    const ROLES = [
        { key: 'president', label: 'President', abbr: 'P' },
        { key: 'eo', label: 'External Officer', abbr: 'EO' },
        { key: 'cf', label: 'Fiscal Council', abbr: 'CF' }
    ];

    return (
        <div className="flex items-center gap-1">
            {ROLES.map((role) => {
                const isCompleted = getReviewerStatus(review, role.key);
                const isCurrentUser = userRole === role.key;

                return (
                    <div
                        key={role.key}
                        className={`
                            relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all
                            ${isCompleted
                                ? 'bg-esn-green text-white border-esn-green'
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }
                            ${isCurrentUser ? 'ring-2 ring-offset-1 ring-esn-dark-blue z-10' : ''}
                        `}
                        title={`${role.label}: ${isCompleted ? 'Completed' : 'Pending'}${isCurrentUser ? ' (You)' : ''}`}
                    >
                        {role.abbr}

                        {/* Status Indicator Dot for current user if pending */}
                        {isCurrentUser && !isCompleted && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewerBadges;
