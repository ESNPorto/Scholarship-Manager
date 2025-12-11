import React from 'react';
import { Eye, CheckCircle2, Circle } from 'lucide-react';
import DocumentIcon from '../common/DocumentIcon';

const EvaluationCard = ({ title, url, verified, onVerify, score, onScoreChange, maxScore = 25, onPreview, type }) => {
    const getScoreLabel = (s, max) => {
        const pct = s / max;
        if (pct < 0.4) return 'Poor';
        if (pct < 0.7) return 'Fair';
        if (pct < 0.9) return 'Good';
        return 'Excellent';
    };

    const label = getScoreLabel(score || 0, maxScore);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2e3192]/5">
                        <DocumentIcon type={type} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        {url ? (
                            <button onClick={() => onPreview(url)} className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                                <Eye className="w-3.5 h-3.5" /> View Document
                            </button>
                        ) : (
                            <span className="text-sm text-gray-400 italic">No document attached</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onVerify}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${verified ? 'bg-[#7ac143]/10 text-[#7ac143]' : 'bg-gray-100 text-gray-400 hover:bg-[#7ac143]/10 hover:text-[#7ac143]'}`}
                >
                    {verified ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            </div>

            {/* Scoring Area */}
            <div className="p-5 bg-gray-50/50 rounded-b-xl">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Score</span>
                    <div className="text-right">
                        <span className="text-sm font-bold mr-2 text-[#2e3192]">{label}</span>
                        <span className="text-2xl font-bold text-gray-900 tabular-nums">{score || 0}</span>
                        <span className="text-gray-400 text-sm font-medium">/{maxScore}</span>
                    </div>
                </div>

                <div className="relative h-10 flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 rounded-full bg-[#2e3192]"
                            style={{ width: `${((score || 0) / maxScore) * 100}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={maxScore}
                        value={score || 0}
                        onChange={(e) => onScoreChange(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Tick marks could go here */}
                </div>
            </div>
        </div>
    );
};

export default EvaluationCard;
