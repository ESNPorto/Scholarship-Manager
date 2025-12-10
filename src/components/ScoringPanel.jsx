import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

const ScoringPanel = ({ review, onUpdate, onSave, onMarkReviewed }) => {
    const [localScores, setLocalScores] = useState(review || {});

    useEffect(() => {
        setLocalScores(review || {});
    }, [review]);

    const handleChange = (field, value) => {
        const updated = { ...localScores, [field]: value };
        setLocalScores(updated);
        onUpdate(updated);
    };

    const calculateTotal = () => {
        const motivation = parseInt(localScores.motivation || 0);
        const academic = parseInt(localScores.academic || 0);
        const presentation = parseInt(localScores.presentation || 0);
        const fit = parseInt(localScores.fit || 0);
        return motivation + academic + presentation + fit;
    };

    const totalScore = calculateTotal();

    return (
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-8 tracking-tight">Evaluation</h3>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                {/* Documents Check */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900">Documents Complete?</span>
                        {localScores.documentsComplete === false && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleChange('documentsComplete', true)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${localScores.documentsComplete === true
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                } `}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleChange('documentsComplete', false)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${localScores.documentsComplete === false
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                } `}
                        >
                            No
                        </button>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-8">
                    {[
                        { id: 'motivation', label: 'Motivation Letter Quality' },
                        { id: 'academic', label: 'Academic Performance' },
                        { id: 'presentation', label: 'Presentation Quality' },
                        { id: 'fit', label: 'Overall Fit' },
                    ].map((field) => (
                        <div key={field.id} className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                <span className="text-2xl font-bold text-blue-600 tabular-nums tracking-tight">
                                    {localScores[field.id] || 0}<span className="text-sm text-gray-400 font-normal ml-1">/25</span>
                                </span>
                            </div>
                            <div className="relative h-2 bg-gray-100 rounded-full">
                                <div
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                                    style={{ width: `${((localScores[field.id] || 0) / 25) * 100}% ` }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="25"
                                    value={localScores[field.id] || 0}
                                    onChange={(e) => handleChange(field.id, parseInt(e.target.value))}
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none transition-all duration-300"
                                    style={{ left: `calc(${((localScores[field.id] || 0) / 25) * 100}% - 12px)` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Score */}
                <div className="py-6 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Score</span>
                        <span className={`text-4xl font-bold tabular-nums tracking-tight ${totalScore >= 75 ? 'text-green-600' :
                                totalScore >= 50 ? 'text-blue-600' :
                                    'text-orange-500'
                            } `}>{totalScore}<span className="text-lg text-gray-300 ml-1">/100</span></span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Evaluator Notes</label>
                    <textarea
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all resize-none"
                        placeholder="Add comments about this candidate..."
                        value={localScores.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
                <button
                    onClick={onMarkReviewed}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 active:scale-95"
                >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Reviewed
                </button>
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    Save & Back to List
                </button>
            </div>
        </div>
    );
};

export default ScoringPanel;
