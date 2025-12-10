import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

const ScoringPanel = ({ review, onUpdate, onSave, onMarkReviewed }) => {
    const [localScores, setLocalScores] = useState(review || {});
    const [isSaving, setIsSaving] = useState(false);

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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Evaluation</h3>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {/* Documents Check */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Documents Complete?</span>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="docs"
                                checked={localScores.documentsComplete === true}
                                onChange={() => handleChange('documentsComplete', true)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="docs"
                                checked={localScores.documentsComplete === false}
                                onChange={() => handleChange('documentsComplete', false)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">No</span>
                        </label>
                    </div>
                </div>

                {/* Sliders */}
                {[
                    { id: 'motivation', label: 'Motivation Letter Quality' },
                    { id: 'academic', label: 'Academic Performance' },
                    { id: 'presentation', label: 'Presentation Quality' },
                    { id: 'fit', label: 'Overall Fit' },
                ].map((field) => (
                    <div key={field.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{field.label}</span>
                            <span className="font-bold text-blue-600">{localScores[field.id] || 0}/25</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="25"
                            value={localScores[field.id] || 0}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 px-1">
                            <span>0</span>
                            <span>12.5</span>
                            <span>25</span>
                        </div>
                    </div>
                ))}

                {/* Total Score */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">TOTAL SCORE</span>
                        <span className="text-2xl font-bold text-blue-600">{calculateTotal()}/100</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Evaluator Notes</label>
                    <textarea
                        className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Add comments about this candidate..."
                        value={localScores.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3 pt-4 border-t border-gray-100">
                <button
                    onClick={onMarkReviewed}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Reviewed
                </button>
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Save & Back to List
                </button>
            </div>
        </div>
    );
};

export default ScoringPanel;
