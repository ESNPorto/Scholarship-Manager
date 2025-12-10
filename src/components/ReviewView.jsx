import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ScoringPanel from './ScoringPanel';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2, Calendar, MapPin, GraduationCap, Mail, Home } from 'lucide-react';

const DocumentCard = ({ title, url, verified, onVerify }) => {
    if (!url) return null;

    return (
        <div className={`group relative p-5 rounded-2xl border transition-all duration-300 ${verified
                ? 'bg-green-50/50 border-green-200 shadow-sm'
                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl transition-colors ${verified ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                    }`}>
                    <FileText className="w-5 h-5" />
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onVerify();
                    }}
                    className={`text-sm flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${verified
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                >
                    <CheckCircle2 className={`w-4 h-4 ${verified ? 'fill-current' : ''}`} />
                    {verified ? 'Verified' : 'Verify'}
                </button>
            </div>
            <h4 className="font-semibold text-gray-900 text-sm mb-4 line-clamp-2 h-10 leading-relaxed" title={title}>{title}</h4>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group-hover:shadow"
            >
                Open Document
                <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Info & Docs (Scrollable) */}
            <div className="lg:col-span-8 space-y-8 overflow-y-auto pr-4 pb-20 scrollbar-hide">
                {/* Header */}
                <div className="flex items-start gap-5 mb-2">
                    <button
                        onClick={navigateToDashboard}
                        className="group p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{application.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getReviewStatus(activeApplicationId) === 'reviewed' ? 'bg-green-50 text-green-700 border-green-100' :
                                    getReviewStatus(activeApplicationId) === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                        'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                {getReviewStatus(activeApplicationId).replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {application.university}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {application.destinationCity}, {application.destinationCountry}</span>
                        </div>
                    </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Candidate Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <Mail className="w-4 h-4" /> Email
                            </div>
                            <div className="font-semibold text-gray-900">{application.email}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <Calendar className="w-4 h-4" /> Birth Date
                            </div>
                            <div className="font-semibold text-gray-900">{application.birthDate}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <GraduationCap className="w-4 h-4" /> Course
                            </div>
                            <div className="font-semibold text-gray-900">{application.course} <span className="text-gray-400 font-normal">({application.year})</span></div>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <Home className="w-4 h-4" /> Address
                            </div>
                            <div className="font-semibold text-gray-900">{application.address}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <Calendar className="w-4 h-4" /> Submission Date
                            </div>
                            <div className="font-semibold text-gray-900">{new Date(application.timestamp).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 ml-1">Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div className="lg:col-span-4 lg:h-full">
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
