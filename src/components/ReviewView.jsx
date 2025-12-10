import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ScoringPanel from './ScoringPanel';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

const DocumentCard = ({ title, url, verified, onVerify }) => {
    if (!url) return null;

    return (
        <div className={`p-4 rounded-xl border transition-all ${verified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                </div>
                <button
                    onClick={onVerify}
                    className={`text-sm flex items-center gap-1 transition-colors ${verified ? 'text-green-600 font-medium' : 'text-gray-400 hover:text-green-600'}`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {verified ? 'Verified' : 'Verify'}
                </button>
            </div>
            <h4 className="font-medium text-gray-900 text-sm mb-3 line-clamp-2 h-10" title={title}>{title}</h4>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
                Open Document
                <ExternalLink className="w-3 h-3" />
            </a>
        </div>
    );
};

const ReviewView = () => {
    const {
        activeApplicationId,
        applications,
        reviews,
        updateReview,
        navigateToDashboard,
        getReviewStatus
    } = useApp();

    const application = applications.find(app => app.id === activeApplicationId);
    const review = reviews[activeApplicationId] || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeApplicationId]);

    if (!application) return <div>Application not found</div>;

    const handleScoreUpdate = (newScores) => {
        updateReview(activeApplicationId, newScores);
    };

    const handleSave = () => {
        // Status is inferred or manually set, but 'Save & Back' implies we keep current progress
        // If not started, maybe set to in_progress?
        if (getReviewStatus(activeApplicationId) === 'not_started') {
            updateReview(activeApplicationId, { status: 'in_progress' });
        }
        navigateToDashboard();
    };

    const handleMarkReviewed = () => {
        updateReview(activeApplicationId, { status: 'reviewed' });
        navigateToDashboard();
    };

    const toggleDocumentVerification = (docKey) => {
        const verifiedDocs = review.verifiedDocs || {};
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: !verifiedDocs[docKey]
        };
        updateReview(activeApplicationId, { verifiedDocs: newVerifiedDocs });
    };

    const docLabels = {
        iban: 'IBAN & Bank Details',
        motivation: 'Motivation Letter',
        records: 'Academic Records',
        learningAgreement: 'Learning Agreement',
        irs: 'IRS Declaration',
        presentation: 'Erasmus Presentation'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Info & Docs (Scrollable) */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={navigateToDashboard}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{application.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{application.university}</span>
                            <span>•</span>
                            <span>{application.destinationCity}, {application.destinationCountry}</span>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getReviewStatus(activeApplicationId) === 'reviewed' ? 'bg-green-100 text-green-700' :
                                getReviewStatus(activeApplicationId) === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {getReviewStatus(activeApplicationId).replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Candidate Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                        <div>
                            <div className="text-gray-500 mb-1">Email</div>
                            <div className="font-medium">{application.email}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Birth Date</div>
                            <div className="font-medium">{application.birthDate}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Course</div>
                            <div className="font-medium">{application.course} ({application.year})</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-gray-500 mb-1">Address</div>
                            <div className="font-medium">{application.address}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Submission Date</div>
                            <div className="font-medium">{new Date(application.timestamp).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(application.documents).map(([key, url]) => (
                            <DocumentCard
                                key={key}
                                title={docLabels[key] || key}
                                url={url}
                                verified={review.verifiedDocs?.[key]}
                                onVerify={() => toggleDocumentVerification(key)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Scoring (Fixed on Desktop) */}
            <div className="lg:col-span-1 lg:h-full">
                <ScoringPanel
                    review={review}
                    onUpdate={handleScoreUpdate}
                    onSave={handleSave}
                    onMarkReviewed={handleMarkReviewed}
                />
            </div>
        </div>
    );
};

export default ReviewView;
