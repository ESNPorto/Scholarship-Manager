import React, { useMemo } from 'react';
import { Eye, CheckCircle2, Circle, Users } from 'lucide-react';
import DocumentIcon from '../common/DocumentIcon';

const MultiEvaluationCard = ({
    title,
    type,
    url,
    verified,
    onVerify,
    scores = {}, // { president: 0, eo: 0, cf: 0 }
    onScoreChange, // (role, value) => ...
    maxScore = 20,
    onPreview
}) => {

    const ROLES = [
        { key: 'president', label: 'President', abbr: 'P' },
        { key: 'eo', label: 'External Officer', abbr: 'EO' },
        { key: 'cf', label: 'Fiscal Council (CF)', abbr: 'CF' }
    ];

    const average = useMemo(() => {
        const p = scores.president || 0;
        const e = scores.eo || 0;
        const c = scores.cf || 0;
        return ((p + e + c) / 3).toFixed(1);
    }, [scores]);

    const getScoreLabel = (val, max) => {
        const pct = val / max;
        if (pct < 0.4) return 'Poor';
        if (pct < 0.7) return 'Fair';
        if (pct < 0.9) return 'Good';
        return 'Excellent';
    };

    const avgLabel = getScoreLabel(parseFloat(average), maxScore);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-esn-dark-blue/5">
                        <DocumentIcon type={type} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <div className="flex items-center gap-3">
                            {url ? (
                                <button onClick={() => onPreview(url)} className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                                    <Eye className="w-3.5 h-3.5" /> View Document
                                </button>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No document attached</span>
                            )}
                            <div className="h-4 w-px bg-gray-200 mx-1"></div>
                            <span className="text-xs font-semibold text-esn-dark-blue flex items-center gap-1 bg-esn-dark-blue/5 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3" /> Multi-Reviewer
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onVerify}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${verified ? 'bg-esn-green/10 text-esn-green' : 'bg-gray-100 text-gray-400 hover:bg-esn-green/10 hover:text-esn-green'}`}
                    title="Toggle Verification"
                >
                    {verified ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            </div>

            {/* Content Container */}
            <div className="flex flex-col md:flex-row">

                {/* Inputs Section */}
                <div className="flex-1 p-5 space-y-6 bg-white md:border-r border-gray-50">
                    {ROLES.map((role) => (
                        <div key={role.key} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{role.label}</span>
                                <span className="font-bold text-gray-900 tabular-nums">{(scores[role.key] || 0)} <span className="text-gray-400 text-xs font-normal">/{maxScore}</span></span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-esn-dark-blue rounded-full"
                                    style={{ width: `${((scores[role.key] || 0) / maxScore) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max={maxScore}
                                    value={scores[role.key] || 0}
                                    onChange={(e) => onScoreChange(role.key, parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Average Score Summary */}
                <div className="bg-gray-50/50 p-6 md:w-48 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Internal Average</span>
                    <span className="text-4xl font-bold text-esn-dark-blue tracking-tight tabular-nums mb-1">{average}</span>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-600 mb-4">
                        Max {maxScore}
                    </span>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-esn-cyan"
                            style={{ width: `${(parseFloat(average) / maxScore) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-esn-cyan mt-2">{avgLabel} Quality</span>
                </div>
            </div>
        </div>
    );
};

export default MultiEvaluationCard;
