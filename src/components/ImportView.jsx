
import React, { useState, useEffect } from 'react';
import { Upload, Plus, FileText, CheckCircle, AlertCircle, Database, Edit, Trash2, X } from 'lucide-react';
import { createEdition, batchSaveApplications, updateEdition, deleteEdition, getApplicationsByEdition } from '../services/db';
import { parseCSV, mapApplicationData, CSV_FIELD_CONFIG } from '../utils/csvParser';
import { useApp } from '../context/AppContext';

import ColumnMappingModal from './ColumnMappingModal';

const ImportView = () => {
    const { editions, refreshEditions, isEditionsLoading, currentEditionId, loadApplications } = useApp();

    // Edition State
    const currentYear = new Date().getFullYear();
    const [name, setName] = useState('');
    const [year, setYear] = useState(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`);
    const [semester, setSemester] = useState('1st');

    // Edit Mode State
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Import State
    const [selectedEditionId, setSelectedEditionId] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    // Mapping State
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [parsedData, setParsedData] = useState([]);

    // Preview Data State
    const [previewApps, setPreviewApps] = useState([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [visibleLimit, setVisibleLimit] = useState(50);

    useEffect(() => {
        if (editions.length > 0 && !selectedEditionId) {
            setSelectedEditionId(editions[0].id);
        }
    }, [editions, selectedEditionId]);

    // Load preview data when edition changes
    useEffect(() => {
        const loadPreview = async () => {
            if (!selectedEditionId) {
                setPreviewApps([]);
                return;
            }
            setIsPreviewLoading(true);
            try {
                const apps = await getApplicationsByEdition(selectedEditionId);
                setPreviewApps(apps);
                setVisibleLimit(50); // Reset limit on new load
            } catch (err) {
                console.error("Failed to load preview data:", err);
            } finally {
                setIsPreviewLoading(false);
            }
        };
        loadPreview();
    }, [selectedEditionId, importStatus]); // Reload on import success too

    const handleCreateOrUpdateEdition = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const editionData = {
                name: name,
                year: year,
                semester: semester,
                isActive: true
            };

            if (editingId) {
                await updateEdition(editingId, editionData);
                setImportStatus({ type: 'success', message: 'Edition updated successfully!' });
            } else {
                const newEdition = await createEdition(editionData);
                setSelectedEditionId(newEdition.id);
                setImportStatus({ type: 'success', message: 'Edition created successfully!' });
            }

            await refreshEditions();
            resetForm();
        } catch (error) {
            setImportStatus({ type: 'error', message: `Failed to ${editingId ? 'update' : 'create'} edition.` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this edition? This cannot be undone.')) {
            try {
                await deleteEdition(id);
                await refreshEditions();
                if (selectedEditionId === id) setSelectedEditionId('');
                setImportStatus({ type: 'success', message: 'Edition deleted successfully.' });
            } catch (error) {
                setImportStatus({ type: 'error', message: 'Failed to delete edition.' });
            }
        }
    };

    const handleEdit = (edition, e) => {
        e.stopPropagation();
        setEditingId(edition.id);
        setName(edition.name);
        setYear(edition.year);
        setSemester(edition.semester);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setYear(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`);
        setSemester('1st');
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setImportFile(file);
            setImportStatus(null);
        } else {
            setImportStatus({ type: 'error', message: 'Please upload a valid CSV file.' });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
            setImportStatus(null);
        }
    };

    const handleImportClick = async () => {
        if (!selectedEditionId || !importFile) return;

        setIsImporting(true);
        setImportStatus(null);

        try {
            // 1. Parse CSV to get headers and raw data
            const result = await parseCSV(importFile);

            // Check if we have data and headers
            if (!result.data || result.data.length === 0) {
                throw new Error("CSV file is empty or could not be parsed.");
            }

            if (!result.meta || !result.meta.fields || result.meta.fields.length === 0) {
                throw new Error("Could not detect headers in CSV file.");
            }

            setParsedData(result.data);
            setCsvHeaders(result.meta.fields);
            setShowMappingModal(true); // Open the modal

        } catch (error) {
            console.error("Pre-import failed:", error);
            setImportStatus({ type: 'error', message: `Failed to parse CSV: ${error.message}` });
        } finally {
            setIsImporting(false); // Stop loading spinner (modal will handle next step)
        }
    };

    const handleMappingConfirm = async (mapping) => {
        setShowMappingModal(false);
        setIsImporting(true); // Restart loading

        try {
            // 2. Map data using the user-confirmed mapping
            const mappedData = await mapApplicationData(parsedData, selectedEditionId, mapping);

            // 3. Save to DB
            await batchSaveApplications(selectedEditionId, mappedData);

            setImportStatus({ type: 'success', message: `Successfully imported ${mappedData.length} applications!` });
            setImportFile(null);
            setParsedData([]);
            setCsvHeaders([]);

            // Reload context if we imported into the current edition
            if (selectedEditionId === currentEditionId) {
                await loadApplications(selectedEditionId);
            }
        } catch (error) {
            console.error("Import execution failed:", error);
            setImportStatus({ type: 'error', message: `Import failed: ${error.message}` });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Edition Manager</h2>
                    <p className="text-gray-500 mt-1">Create scholarship editions and import application data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Create Edition */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            {editingId ? <Edit className="w-5 h-5 text-esn-dark-blue" /> : <Plus className="w-5 h-5 text-esn-pink" />}
                            {editingId ? 'Edit Edition' : 'New Edition'}
                        </h3>
                        <form onSubmit={handleCreateOrUpdateEdition} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edition Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Spring 2025"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
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
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                    <select
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
                                    >
                                        <option value="1st">1st</option>
                                        <option value="2nd">2nd</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !name}
                                    className={`flex-1 justify-center py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${editingId
                                        ? 'bg-esn-dark-blue hover:bg-esn-dark-blue/90 text-white'
                                        : 'bg-esn-green hover:bg-esn-green/90 text-white'
                                        }`}
                                >
                                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Edition' : 'Create Edition')}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-gray-400" />
                            Existing Editions
                        </h3>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {isEditionsLoading ? (
                                <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                            ) : editions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No editions found.</p>
                            ) : (
                                <div className="border rounded-xl separate-borders border-spacing-0 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2">Year</th>
                                                <th className="px-4 py-2 w-20 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {editions.map((edition) => (
                                                <tr
                                                    key={edition.id}
                                                    onClick={() => setSelectedEditionId(edition.id)}
                                                    className={`group cursor-pointer transition-colors ${selectedEditionId === edition.id
                                                        ? 'bg-esn-cyan/5'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {selectedEditionId === edition.id && (
                                                                <CheckCircle className="w-3.5 h-3.5 text-esn-cyan" />
                                                            )}
                                                            <span className={`font-medium ${selectedEditionId === edition.id ? 'text-esn-cyan' : 'text-gray-900'}`}>
                                                                {edition.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {edition.semester} Sem {edition.year}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => handleEdit(edition, e)}
                                                                className="p-1.5 text-gray-400 hover:text-esn-dark-blue hover:bg-gray-100 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(edition.id, e)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Import Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Upload className="w-6 h-6 text-esn-dark-blue" />
                            Import Data
                        </h3>

                        {!selectedEditionId ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">Select or create an edition to start importing.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Target Edition: <span className="font-bold">{editions.find(e => e.id === selectedEditionId)?.name}</span></p>
                                        <p className="text-xs text-blue-700 mt-1">Creating new records for candidates. If a candidate re-applies, a new record is created scoped to this edition.</p>
                                    </div>
                                </div>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${importFile ? 'border-esn-green bg-esn-green/5' : 'border-gray-300 hover:border-esn-dark-blue hover:bg-gray-50'
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    {importFile ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-esn-green/10 rounded-full flex items-center justify-center mb-4">
                                                <FileText className="w-8 h-8 text-esn-green" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">{importFile.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImportFile(null);
                                                }}
                                                className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium z-10 relative"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">Drop CSV file here</p>
                                            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                                        </div>
                                    )}
                                </div>

                                {importStatus && (
                                    <div className={`p-4 rounded-lg flex items-center gap-3 ${importStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        <p className="text-sm font-medium">{importStatus.message}</p>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleImportClick}
                                        disabled={!importFile || isImporting}
                                        className="px-8 py-3 bg-esn-dark-blue hover:bg-esn-dark-blue/90 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                    >
                                        {isImporting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            <>
                                                Start Import
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Column Mapping Modal */}
            <ColumnMappingModal
                isOpen={showMappingModal}
                headers={csvHeaders}
                onClose={() => {
                    setShowMappingModal(false);
                    setIsImporting(false);
                    setParsedData([]);
                    setCsvHeaders([]);
                }}
                onConfirm={handleMappingConfirm}
            />

            {/* Data Preview Section */}
            {selectedEditionId && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Data Preview
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {previewApps.length} applications for <span className="font-medium text-gray-900">{editions.find(e => e.id === selectedEditionId)?.name}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => loadApplications(selectedEditionId)}
                            className="text-sm text-esn-dark-blue hover:text-esn-dark-blue/80 font-medium"
                        >
                            Refresh Data
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {isPreviewLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading data...</div>
                        ) : previewApps.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-gray-50">
                                No applications found for this edition. Import some data to get started.
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        {CSV_FIELD_CONFIG.map((field) => (
                                            <th
                                                key={field.key}
                                                className={`px-4 py-3 ${field.key === 'name' ? 'sticky left-0 z-10 shadow-sm bg-gray-50' : ''}`}
                                            >
                                                {field.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {previewApps.slice(0, visibleLimit).map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            {CSV_FIELD_CONFIG.map((field) => {
                                                // Resolve path: e.g. "personalInfo.email" -> app.personalInfo?.email
                                                const value = field.path.split('.').reduce((obj, key) => obj?.[key], app);

                                                if (field.key === 'name') {
                                                    return (
                                                        <td key={field.key} className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-sm border-r border-gray-100">
                                                            {value || 'Unknown'}
                                                        </td>
                                                    );
                                                }

                                                if (field.type === 'link') {
                                                    return (
                                                        <td key={field.key} className="px-4 py-3 text-blue-600 max-w-[150px] truncate">
                                                            {value ? (
                                                                <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                    View File
                                                                </a>
                                                            ) : '-'}
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={field.key} className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={value}>
                                                        {value || '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {previewApps.length > 0 && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col items-center gap-2">
                                <p className="text-xs text-gray-500">
                                    Showing {Math.min(visibleLimit, previewApps.length)} of {previewApps.length} records
                                </p>
                                {visibleLimit < previewApps.length && (
                                    <button
                                        onClick={() => setVisibleLimit(prev => prev + 50)}
                                        className="text-sm font-medium text-esn-dark-blue hover:text-esn-dark-blue/80 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Load more records
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportView;
