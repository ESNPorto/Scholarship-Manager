
import React, { useState, useEffect } from 'react';
import { Upload, Plus, FileText, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { createEdition, batchSaveApplications } from '../services/db';
import { parseCSV, mapApplicationData } from '../utils/csvParser';
import { useApp } from '../context/AppContext';

const ImportView = () => {
    const { editions, refreshEditions, isEditionsLoading, currentEditionId, loadApplications } = useApp();

    // New Edition State
    const [newEditionName, setNewEditionName] = useState('');
    const currentYear = new Date().getFullYear();
    const [newEditionYear, setNewEditionYear] = useState(`${(currentYear - 1).toString().slice(2)}/${currentYear.toString().slice(2)}`); // e.g. 24/25 default
    const [newEditionSemester, setNewEditionSemester] = useState('1st');
    const [isCreating, setIsCreating] = useState(false);

    // Import State
    const [selectedEditionId, setSelectedEditionId] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        if (editions.length > 0 && !selectedEditionId) {
            setSelectedEditionId(editions[0].id);
        }
    }, [editions, selectedEditionId]);

    const handleCreateEdition = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const editionData = {
                name: newEditionName,
                year: newEditionYear,
                semester: newEditionSemester,
                isActive: true // Default to active?
            };
            const newEdition = await createEdition(editionData);

            await refreshEditions();
            setSelectedEditionId(newEdition.id);
            setNewEditionName('');
            setImportStatus({ type: 'success', message: 'Edition created successfully!' });
        } catch (error) {
            setImportStatus({ type: 'error', message: 'Failed to create edition.' });
        } finally {
            setIsCreating(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setImportFile(file);
        } else {
            setImportStatus({ type: 'error', message: 'Please upload a valid CSV file.' });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setImportFile(file);
    };

    const handleImport = async () => {
        if (!selectedEditionId || !importFile) return;

        setIsImporting(true);
        setImportStatus(null);

        try {
            const rawData = await parseCSV(importFile);
            const mappedData = await mapApplicationData(rawData, selectedEditionId);

            await batchSaveApplications(selectedEditionId, mappedData);

            setImportStatus({ type: 'success', message: `Successfully imported ${mappedData.length} applications!` });
            setImportFile(null);

            // Reload context if we imported into the current edition
            if (selectedEditionId === currentEditionId) {
                await loadApplications(selectedEditionId);
            }
        } catch (error) {
            console.error("Import failed:", error);
            setImportStatus({ type: 'error', message: `Import failed: ${error.message} ` });
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
                            <Plus className="w-5 h-5 text-esn-pink" />
                            New Edition
                        </h3>
                        <form onSubmit={handleCreateEdition} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edition Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Spring 2025"
                                    value={newEditionName}
                                    onChange={(e) => setNewEditionName(e.target.value)}
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
                                        value={newEditionYear}
                                        onChange={(e) => setNewEditionYear(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                    <select
                                        value={newEditionSemester}
                                        onChange={(e) => setNewEditionSemester(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
                                    >
                                        <option value="1st">1st</option>
                                        <option value="2nd">2nd</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating || !newEditionName}
                                className="w-full btn-primary justify-center bg-esn-green hover:bg-esn-green/90 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isCreating ? 'Creating...' : 'Create Edition'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-gray-400" />
                            Existing Editions
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {isEditionsLoading ? (
                                <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                            ) : editions.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No editions found.</p>
                            ) : (
                                editions.map((edition) => (
                                    <div
                                        key={edition.id}
                                        onClick={() => setSelectedEditionId(edition.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEditionId === edition.id
                                            ? 'border-esn-cyan bg-esn-cyan/5 ring-1 ring-esn-cyan'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{edition.name}</p>
                                                <p className="text-xs text-gray-500">{edition.semester} Semester {edition.year}</p>
                                            </div>
                                            {selectedEditionId === edition.id && (
                                                <CheckCircle className="w-4 h-4 text-esn-cyan" />
                                            )}
                                        </div>
                                    </div>
                                ))
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
                                        onClick={handleImport}
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
        </div>
    );
};

export default ImportView;
