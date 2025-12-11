import React from 'react';
import { Eye, CheckCircle2, Circle } from 'lucide-react';
import DocumentIcon from '../common/DocumentIcon';

const ComplianceCard = ({ title, url, verified, onVerify, onPreview, type }) => {
    if (!url) return null;
    return (
        <div
            className="group relative bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 overflow-hidden hover:shadow-md"
        >
            <div className="p-4 flex items-center gap-4">
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                    <DocumentIcon type={type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPreview(url)}>
                    <h3 className={`font-semibold text-base truncate ${verified ? 'text-gray-900' : 'text-gray-700'}`}>{title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Eye className="w-3 h-3" /> View Document
                    </p>
                </div>

                {/* Action */}
                <button
                    onClick={(e) => { e.stopPropagation(); onVerify(); }}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${verified ? 'bg-esn-green/10 text-esn-green' : 'bg-gray-100 text-gray-400 hover:bg-esn-green/10 hover:text-esn-green'}`}
                >
                    {verified ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
};

export default ComplianceCard;
