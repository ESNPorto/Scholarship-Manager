import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const DocumentPreviewModal = ({ url, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Reset state when URL changes
    useEffect(() => {
        setLoading(true);
        setError(false);
    }, [url]);

    if (!url) return null;

    const getPreviewConfig = (link) => {
        if (!link) return { type: 'error' };

        // Google Drive ID extraction
        // Supports:
        // - drive.google.com/file/d/[ID]
        // - docs.google.com/document/d/[ID]
        // - docs.google.com/spreadsheets/d/[ID]
        // - drive.google.com/open?id=[ID]
        const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:document\/d\/|spreadsheets\/d\/))([a-zA-Z0-9_-]+)/;
        const driveMatch = link.match(driveRegex);

        if (driveMatch && driveMatch[1]) {
            return {
                type: 'google-drive',
                url: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
                originalUrl: link
            };
        }

        // Image detection
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(link)) {
            return {
                type: 'image',
                url: link,
                originalUrl: link
            };
        }

        // PDF detection
        if (/\.pdf$/i.test(link)) {
            return {
                type: 'pdf',
                url: link,
                originalUrl: link
            };
        }

        return {
            type: 'external',
            url: link,
            originalUrl: link
        };
    };

    const config = getPreviewConfig(url);

    const handleIframeLoad = () => {
        setLoading(false);
    };

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
    };

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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-20">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0 mr-4">
                        <h3 className="font-semibold text-gray-900 truncate" title={url}>
                            Document Preview
                        </h3>
                        {!loading && config.type === 'google-drive' && (
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <AlertCircle className="w-3 h-3" />
                                If blank, allow cookies or open in new tab
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#2e3192] bg-[#2e3192]/5 hover:bg-[#2e3192]/10 rounded-lg transition-colors border border-transparent hover:border-[#2e3192]/20"
                            title="Open in new tab (Recommended if preview fails)"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Open in New Tab</span>
                        </a>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
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
                <div className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                    {/* Loading State */}
                    {loading && !error && config.type !== 'external' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-[#2e3192] animate-spin" />
                                <p className="text-sm text-gray-500">Loading preview...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gray-50 animate-in fade-in">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h4 className="text-gray-900 font-semibold mb-2">Unable to load preview</h4>
                            <p className="text-gray-500 max-w-sm mb-6 text-sm">
                                We couldn't load this document directly. It might be restricted or require authentication.
                            </p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-[#2e3192] text-white rounded-xl hover:bg-[#1a1c5e] transition-colors font-medium cursor-pointer shadow-sm shadow-[#2e3192]/20"
                            >
                                Open Document Externally
                            </a>
                        </div>
                    )}

                    {/* Viewers */}
                    {!error && config.type === 'google-drive' && (
                        <>
                            <iframe
                                src={config.url}
                                className={`w-full h-full border-0 transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={handleIframeLoad}
                                title="Google Drive Preview"
                                allow="autoplay"
                                onError={() => setError(true)}
                            />
                        </>
                    )}

                    {!error && config.type === 'image' && (
                        <img
                            src={config.url}
                            alt="Document Preview"
                            className={`max-w-full max-h-full object-contain p-4 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    )}

                    {!error && config.type === 'pdf' && (
                        <iframe
                            src={config.url}
                            className={`w-full h-full border-0 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={handleIframeLoad}
                            title="PDF Preview"
                            onError={() => setError(true)}
                        />
                    )}

                    {!error && config.type === 'external' && (
                        <div className="flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <ExternalLink className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-gray-900 font-semibold mb-2">External Link</h4>
                            <p className="text-gray-500 max-w-sm mb-6 text-sm">
                                This document format cannot be previewed directly.
                            </p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-[#2e3192] text-white rounded-xl hover:bg-[#1a1c5e] transition-colors font-medium shadow-sm shadow-[#2e3192]/20"
                            >
                                Open Document
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
