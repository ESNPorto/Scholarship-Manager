import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createEdition, updateEdition } from '../services/db';
import { useApp } from '../context/AppContext';
import Select from './common/Select';

const CreateEditionModal = ({ isOpen, onClose, onSuccess, editionToEdit = null }) => {
    const { refreshEditions } = useApp();
    const currentYear = new Date().getFullYear();
    const [name, setName] = useState('');
    const [year, setYear] = useState(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`);
    const [semester, setSemester] = useState('1st');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Populate form for editing
    useEffect(() => {
        if (editionToEdit) {
            setName(editionToEdit.name);
            setYear(editionToEdit.year);
            setSemester(editionToEdit.semester);
        } else {
            // Reset to defaults for create mode
            setName('');
            setYear(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`);
            setSemester('1st');
        }
        setError(null);
    }, [editionToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const editionData = {
                name,
                year,
                semester,
                isActive: true
            };

            if (editionToEdit) {
                await updateEdition(editionToEdit.id, editionData);
                await refreshEditions();
                onSuccess({ ...editionToEdit, ...editionData });
            } else {
                const newEdition = await createEdition(editionData);
                await refreshEditions();
                // Reset form only on successful create (edit keeps values until closed/switched)
                setName('');
                setYear(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`);
                setSemester('1st');
                onSuccess(newEdition);
            }

            onClose();
        } catch (err) {
            console.error("Failed to create edition:", err);
            setError(`Failed to ${editionToEdit ? 'update' : 'create'} edition. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">{editionToEdit ? 'Edit Edition' : 'Create New Edition'}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edition Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Spring 2025"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 24/25"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <Select
                                value={semester}
                                onChange={(value) => setSemester(value)}
                                options={['1st', '2nd']}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name}
                            className="flex-1 px-4 py-2 bg-esn-green hover:bg-esn-green/90 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {editionToEdit ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                editionToEdit ? 'Save Changes' : 'Create & Switch'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditionModal;
