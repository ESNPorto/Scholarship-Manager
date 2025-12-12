import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { CSV_FIELD_CONFIG } from '../utils/csvParser';
import Select from './common/Select';

const ColumnMappingModal = ({ isOpen, onClose, headers, onConfirm }) => {
    const [mapping, setMapping] = useState({});
    const [touched, setTouched] = useState({});

    // Auto-map on mount or when headers change
    useEffect(() => {
        if (isOpen && headers.length > 0) {
            const initialMapping = {};
            CSV_FIELD_CONFIG.forEach(field => {
                // Try exact match first
                let match = headers.find(h => h === field.defaultHeader);

                // If no exact match, try lenient match (ignore case, trim)
                if (!match) {
                    const normalizedDefault = field.defaultHeader.toLowerCase().trim();
                    match = headers.find(h => h.toLowerCase().trim() === normalizedDefault);
                }

                // If still no match, try very lenient (contains) for long headers
                if (!match && field.defaultHeader.length > 20) {
                    match = headers.find(h => h.toLowerCase().includes(field.defaultHeader.substring(0, 20).toLowerCase()));
                }

                if (match) {
                    initialMapping[field.key] = match;
                }
            });
            setMapping(initialMapping);
        }
    }, [isOpen, headers]);

    const handleFieldChange = (key, value) => {
        setMapping(prev => ({ ...prev, [key]: value }));
        setTouched(prev => ({ ...prev, [key]: true }));
    };

    const isInternalFieldRequired = (field) => field.required;

    const isValid = () => {
        // efficient validation: ignore fields that are not required
        const missingRequired = CSV_FIELD_CONFIG.filter(field =>
            field.required && !mapping[field.key]
        );
        return missingRequired.length === 0;
    };

    const handleConfirm = () => {
        if (isValid()) {
            onConfirm(mapping);
        } else {
            // Mark all required fields as touched to show errors
            const allTouched = {};
            CSV_FIELD_CONFIG.forEach(f => {
                if (f.required) allTouched[f.key] = true;
            });
            setTouched(prev => ({ ...prev, ...allTouched }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Map CSV Columns</h3>
                        <p className="text-sm text-gray-500 mt-1">Match columns from your CSV to the application fields.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-6">
                        {/* Info Alert */}
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Automatic Matching Active</p>
                                <p className="mt-1 text-blue-700/80">
                                    We've attempted to automatically match your CSV headers. Please review and adjust the mappings below to ensure accurate data import.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {CSV_FIELD_CONFIG.map((field) => (
                                <div key={field.key} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">{field.label}</span>
                                            {field.required && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 uppercase tracking-wide">Required</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate" title={field.defaultHeader}>
                                            Default: {field.defaultHeader}
                                        </p>
                                    </div>

                                    <div className="flex items-center text-gray-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Select
                                            value={mapping[field.key] || ''}
                                            onChange={(value) => handleFieldChange(field.key, value)}
                                            options={[
                                                { value: '', label: '-- Select Column --' },
                                                ...headers.map(header => ({ value: header, label: header }))
                                            ]}
                                            className="w-full text-sm"
                                            buttonClassName={`${touched[field.key] && field.required && !mapping[field.key]
                                                ? 'border-red-300 ring-2 ring-red-100'
                                                : mapping[field.key]
                                                    ? 'border-esn-green/50'
                                                    : ''
                                                }`}
                                            placeholder="-- Select Column --"
                                        />
                                        {touched[field.key] && field.required && !mapping[field.key] && (
                                            <p className="text-xs text-red-500 mt-1">This field is required.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid()}
                        className="px-8 py-2.5 bg-esn-dark-blue hover:bg-esn-dark-blue/90 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Confirm Mapping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnMappingModal;
