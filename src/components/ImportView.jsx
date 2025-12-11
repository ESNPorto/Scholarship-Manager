import React, { useState, useEffect } from 'react';
import { Upload, Plus, FileText, CheckCircle, AlertCircle, Trash2, Edit, ChevronRight, MoreVertical, Search, Filter, RefreshCw, X, AlertTriangle, FileQuestion } from 'lucide-react';
import { updateEdition, deleteEdition, getApplicationsByEdition, batchSaveApplications } from '../services/db';
import { parseCSV, mapApplicationData, CSV_FIELD_CONFIG } from '../utils/csvParser';
import { useApp } from '../context/AppContext';

import ColumnMappingModal from './ColumnMappingModal';
import CreateEditionModal from './CreateEditionModal';


const ImportView = () => {
    const { editions, refreshEditions, isEditionsLoading, currentEditionId, loadApplications } = useApp();
    const [selectedEditionId, setSelectedEditionId] = useState('');
    const [editionToEdit, setEditionToEdit] = useState(null);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);

    // Import State
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [parsedData, setParsedData] = useState([]);

    // Data Preview State
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
                setVisibleLimit(50);
            } catch (err) {
                console.error("Failed to load preview data:", err);
            } finally {
                setIsPreviewLoading(false);
            }
        };
        loadPreview();
    }, [selectedEditionId, importStatus]);

    const handleEditionCreated = (newEdition) => {
        setSelectedEditionId(newEdition.id);
    };

    const handleDeleteEdition = async () => {
        if (!selectedEditionId) return;
        if (window.confirm('Are you sure you want to delete this edition? This cannot be undone.')) {
            try {
                await deleteEdition(selectedEditionId);
                await refreshEditions();
                setSelectedEditionId('');
                setShowDeleteMenu(false);
            } catch (error) {
                console.error("Failed to delete edition", error);
                alert("Failed to delete edition");
            }
        }
    };

    // --- Import Logic ---
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

    const handleStartImport = async () => {
        if (!selectedEditionId || !importFile) return;
        setIsImporting(true);
        setImportStatus(null);

        try {
            const result = await parseCSV(importFile);
            if (!result.data || result.data.length === 0) throw new Error("CSV file is empty or could not be parsed.");
            if (!result.meta || !result.meta.fields || result.meta.fields.length === 0) throw new Error("Could not detect headers in CSV file.");

            setParsedData(result.data);
            setCsvHeaders(result.meta.fields);
            setShowMappingModal(true);
        } catch (error) {
            console.error("Pre-import failed:", error);
            setImportStatus({ type: 'error', message: `Failed to parse CSV: ${error.message}` });
        } finally {
            setIsImporting(false);
        }
    };

    const handleMappingConfirm = async (mapping) => {
        setShowMappingModal(false);
        setIsImporting(true);

        try {
            const mappedData = await mapApplicationData(parsedData, selectedEditionId, mapping);
            await batchSaveApplications(selectedEditionId, mappedData);

            setImportStatus({ type: 'success', message: `Successfully imported ${mappedData.length} records.` });
            setImportFile(null);
            setParsedData([]);
            setCsvHeaders([]);

            if (selectedEditionId === currentEditionId) {
                await loadApplications(selectedEditionId);
            }
        } catch (error) {
            console.error("Import failed:", error);
            setImportStatus({ type: 'error', message: `Import failed: ${error.message}` });
        } finally {
            setIsImporting(false);
        }
    };

    const selectedEdition = editions.find(e => e.id === selectedEditionId);

    // --- Calculated Stats ---
    const totalApps = previewApps.length;
    const missingDocsCount = previewApps.filter(app => {
        if (app.review?.status === 'discarded') return true;
        const docs = app.documents || {};
        const required = ['learningAgreement', 'motivationLetter', 'transcriptOfRecords', 'socialDisadvantageItem', 'presentation', 'proofOfIban', 'citizenCard'];
        return required.some(key => !docs[key] || docs[key].toString().trim() === '');
    }).length;


    // --- Components ---

    const SidebarItem = ({ edition }) => {
        const isSelected = selectedEditionId === edition.id;
        return (
            <div
                onClick={() => setSelectedEditionId(edition.id)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-gray-50 border border-transparent'
                    }`}
            >
                <div className={`w-2 h-2 rounded-full ${edition.isActive ? 'bg-esn-green' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isSelected ? 'text-esn-dark-blue' : 'text-gray-700'}`}>
                        {edition.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {edition.semester} Sem • {edition.year}
                    </p>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 text-esn-cyan" />}
            </div>
        );
    };

    const ImportHero = () => {
        const hasData = previewApps.length > 0;
        const [isExpanded, setIsExpanded] = useState(!hasData);

        // Success Summary Card logic
        if (importStatus?.type === 'success' && !isExpanded) {
            return (
                <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 px-6 py-4 flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-green-800">Import Successful</p>
                            <p className="text-sm text-green-700">
                                {importStatus.message}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setImportStatus(null); // Dismiss
                        }}
                        className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            );
        }

        if (!isExpanded && hasData && !importFile) {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        <div>
                            <p className="font-medium text-gray-900">Current Dataset</p>
                            <p className="text-sm text-gray-500">
                                Last updated {selectedEdition ? new Date().toLocaleDateString() : 'recently'} • {previewApps.length} records
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="px-4 py-2 bg-esn-dark-blue text-white text-sm font-medium rounded-lg hover:bg-esn-dark-blue/90 transition-colors"
                    >
                        Import New Batch
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-esn-cyan" />
                        Import Applications
                    </h3>
                    {hasData && (
                        <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${importFile ? 'border-esn-green bg-esn-green/5' : 'border-gray-300 hover:border-esn-dark-blue hover:bg-gray-50'
                        }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    {!importFile && (
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    )}

                    {importFile ? (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-esn-green/10 rounded-full flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-esn-green" />
                            </div>
                            <p className="font-medium text-gray-900">{importFile.name}</p>
                            <p className="text-xs text-gray-500 mb-4">{(importFile.size / 1024).toFixed(1)} KB</p>

                            <button
                                onClick={handleStartImport}
                                disabled={isImporting}
                                className="px-6 py-2 bg-esn-green text-white rounded-lg font-medium hover:bg-esn-green/90 transition-colors flex items-center gap-2"
                            >
                                {isImporting ? 'Processing...' : 'Confirm Import'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4">
                            <Upload className="w-10 h-10 text-gray-300 mb-3" />
                            <p className="font-medium text-gray-600">Drop CSV file here</p>
                            <p className="text-sm text-gray-400">or click to browse</p>
                        </div>
                    )}
                </div>

                {importStatus && importStatus.type !== 'success' && (
                    <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm bg-red-50 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {importStatus.message}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 bg-gray-50/50">
            {/* --- SIDEBAR --- */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
                <div className="p-5 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Workspaces</h2>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-2 bg-esn-dark-blue text-white rounded-lg hover:bg-esn-dark-blue/90 transition-colors shadow-sm"
                            title="New Edition"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search editions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-esn-cyan/20 focus:border-esn-cyan transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {isEditionsLoading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                    ) : editions.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(edition => (
                        <SidebarItem key={edition.id} edition={edition} />
                    ))}

                    {editions.length === 0 && !isEditionsLoading && (
                        <div className="text-center py-10 text-gray-400 italic text-sm">
                            No editions yet.<br />Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN STAGE --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50">
                {selectedEdition ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                    {selectedEdition.name}
                                </h1>
                                <p className="text-gray-500 mt-1 font-medium">
                                    {selectedEdition.semester} Semester • Academic Year {selectedEdition.year}
                                </p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                {showDeleteMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                        <button
                                            onClick={() => {
                                                setEditionToEdit(selectedEdition);
                                                setIsCreateModalOpen(true);
                                                setShowDeleteMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Edition
                                        </button>
                                        <button
                                            onClick={handleDeleteEdition}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Edition
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

                            {/* Import Hero (with potential success card) */}
                            {importStatus?.type === 'success' ? (
                                <ImportHero />
                            ) : (
                                <ImportHero />
                            )}

                            {/* Stats Bar (Only if data exists) */}
                            {previewApps.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Total Applications</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalApps}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                            <FileQuestion className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Missing Documents</p>
                                            <p className="text-2xl font-bold text-gray-900">{missingDocsCount}</p>
                                        </div>
                                    </div>


                                </div>
                            )}

                            {/* Data Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        Data Preview
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => loadApplications(selectedEditionId)}
                                            className="p-2 text-gray-500 hover:text-esn-dark-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Refresh"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {isPreviewLoading ? (
                                    <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                                        Loading applications...
                                    </div>
                                ) : previewApps.length === 0 ? (
                                    <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 font-medium">No data in this workspace yet.</p>
                                        <p className="text-sm text-gray-400 mt-1">Import a CSV file to populate this table.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto max-w-full">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-3 sticky left-0 bg-gray-50 z-10 shadow-sm border-r border-gray-200">Candidate Name</th>

                                                        {CSV_FIELD_CONFIG.filter(f => f.key !== 'name').map((field) => (
                                                            <th key={field.key} className="px-4 py-3">
                                                                {field.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {previewApps.slice(0, visibleLimit).map((app) => (
                                                        <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">

                                                            <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">
                                                                {app.personalInfo?.name || 'Unknown'}
                                                            </td>



                                                            {CSV_FIELD_CONFIG.filter(f => f.key !== 'name').map((field) => {
                                                                const value = field.path.split('.').reduce((obj, key) => obj?.[key], app);

                                                                if (field.type === 'link') {
                                                                    return (
                                                                        <td key={field.key} className="px-4 py-3">
                                                                            {value ? (
                                                                                <a
                                                                                    href={value}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-esn-dark-blue/10 text-esn-dark-blue hover:bg-esn-dark-blue/20 text-xs font-medium transition-colors"
                                                                                >
                                                                                    <FileText className="w-3 h-3" />
                                                                                    PDF
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-gray-300">-</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                }

                                                                return (
                                                                    <td key={field.key} className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                                                                        {value || <span className="text-gray-300">-</span>}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {previewApps.length > visibleLimit && (
                                            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                                                <button
                                                    onClick={() => setVisibleLimit(prev => prev + 50)}
                                                    className="text-sm font-medium text-esn-dark-blue hover:underline"
                                                >
                                                    Load more...
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Workspace Selected</h3>
                        <p className="mt-1">Select an edition from the sidebar to manage data.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateEditionModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditionToEdit(null);
                }}
                onSuccess={handleEditionCreated}
                editionToEdit={editionToEdit}
            />

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


        </div>
    );
};

export default ImportView;
