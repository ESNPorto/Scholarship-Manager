import React from 'react';
import { X } from 'lucide-react';

const DocumentPreviewModal = ({ url, onClose }) => {
    if (!url) return null;

    // Extract file ID from Google Drive URL
    const getFileId = (link) => {
        const match = link.match(/id=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    const fileId = getFileId(url);
    const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
            onClick={onClose}
        >
            <div
                className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <h3 className="font-semibold text-gray-900">Document Preview</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close preview"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 relative">
                    {fileId ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            allow="autoplay"
                            title="Document Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <p>Preview not available for this link format.</p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2e3192] hover:underline font-medium"
                            >
                                Open document in new tab
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
