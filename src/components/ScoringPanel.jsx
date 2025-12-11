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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/75 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                <h3 className="text-base font-bold text-gray-900">Evaluation</h3>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin">
                {/* Documents Check */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Documents Complete?</span>
                        {localScores.documentsComplete === false && (
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Incomplete</span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleChange('documentsComplete', true)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all border ${localScores.documentsComplete === true
                                ? 'text-white shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            style={localScores.documentsComplete === true ? { backgroundColor: '#2e3192', borderColor: '#2e3192' } : {}}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleChange('documentsComplete', false)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all border ${localScores.documentsComplete === false
                                ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            No
                        </button>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-6">
                    {[
                        { id: 'motivation', label: 'Motivation Letter' },
                        { id: 'academic', label: 'Academic Perf.' },
                        { id: 'presentation', label: 'Presentation' },
                        { id: 'fit', label: 'Overall Fit' },
                    ].map((field) => (
                        <div key={field.id} className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                <span className="text-sm font-bold px-2 py-0.5 rounded-md tabular-nums" style={{ backgroundColor: 'rgba(46, 49, 146, 0.1)', color: '#2e3192' }}>
                                    {localScores[field.id] || 0}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="25"
                                value={localScores[field.id] || 0}
                                onChange={(e) => handleChange(field.id, parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20"
                                style={{ accentColor: '#2e3192' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] text-sm transition-all resize-none placeholder:text-gray-400"
                        placeholder="Add comments..."
                        value={localScores.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                    />
                </div>
            </div>

            {/* Footer (Total + Actions) */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Score</span>
                    <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: totalScore >= 75 ? '#7ac143' : totalScore >= 50 ? '#2e3192' : '#f47b20' }}>{totalScore}<span className="text-sm text-gray-400 font-normal ml-1">/100</span></span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={onMarkReviewed}
                        className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold transition-all shadow-sm active:scale-95 text-sm"
                        style={{ backgroundColor: '#7ac143', boxShadow: '0 4px 14px rgba(122, 193, 67, 0.25)' }}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Reviewed
                    </button>
                    <button
                        onClick={onSave}
                        className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-medium transition-all active:scale-95 text-sm"
                    >
                        <Save className="w-4 h-4" />
                        Save Progress
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoringPanel;
