import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCheck, FileBarChart, User, GraduationCap, MapPin, Home } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

// Imported Components
import DocumentIcon from './common/DocumentIcon';
import StatusDropdown from './common/StatusDropdown';
import ComplianceCard from './review/ComplianceCard';
import EvaluationCard from './review/EvaluationCard';
import CommentSection from './review/CommentSection';


// --- Main Component ---

const ReviewView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [previewDoc, setPreviewDoc] = useState(null);
    const {
        applications,
        reviews,
        updateReview,
        getReviewStatus,
        isLoading
    } = useApp();

    const application = applications.find(app => String(app.id) === id);
    const review = reviews[id] || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esn-dark-blue"></div>
            </div>
        );
    }

    if (!application) return <div>Application not found</div>;

    // --- Handlers ---

    const handleScoreChange = (field, value) => {
        updateReview(id, { [field]: value });
    };

    const toggleDocumentVerification = (docKey) => {
        const verifiedDocs = review.verifiedDocs || {};
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: !verifiedDocs[docKey]
        };

        const updates = { verifiedDocs: newVerifiedDocs };

        // Auto-update status to 'reviewed' if all 6 checks are complete
        const newVerifiedCount = Object.values(newVerifiedDocs).filter(Boolean).length;
        if (newVerifiedCount === 6) {
            updates.status = 'reviewed';
        } else if (getReviewStatus(id) === 'not_started') {
            updates.status = 'in_progress';
        }

        updateReview(id, updates);
    };

    const handleAddComment = (text) => {
        const newComment = {
            text,
            timestamp: new Date().toISOString(),
            author: currentUser?.displayName || 'Reviewer',
            authorPhoto: currentUser?.photoURL,
            authorId: currentUser?.uid
        };
        const updatedComments = [...(review.comments || []), newComment];
        updateReview(id, { comments: updatedComments });
    };

    const handleSave = () => {
        if (getReviewStatus(id) === 'not_started') {
            updateReview(id, { status: 'in_progress' });
        }
        navigate('/');
    };

    const handleMarkReviewed = () => {
        updateReview(id, { status: 'reviewed' });
        navigate('/');
    };

    // --- Derived State ---

    const totalScore = calculateScore(review);
    const verifiedCount = Object.values(review.verifiedDocs || {}).filter(Boolean).length;
    const totalDocs = 6; // Fixed number of checks
    const progress = Math.round((verifiedCount / totalDocs) * 100);

    // --- Render ---

    return (
        <div className="min-h-screen bg-gray-50/30 pb-32">
            {/* Top Progress Bar (Hijacks the scroll bar position) */}
            <div className="fixed top-16 left-0 right-0 h-2 bg-gray-100 z-40">
                <div
                    className="h-full bg-esn-dark-blue transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="max-w-3xl mx-auto px-4 pt-8">
                {/* 1. Header & Navigation */}
                <div className="mb-8">


                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">{application.name}</h1>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="px-3 py-1 rounded-full bg-esn-dark-blue/10 text-esn-dark-blue font-medium flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" /> {application.course}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" /> {application.destinationCity}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                    <Home className="w-4 h-4" /> {application.university}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <CommentSection
                        comments={review.comments}
                        onAddComment={handleAddComment}
                        currentUser={currentUser}
                    />

                    {/* Compliance Checks */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-gray-400" />
                            Compliance Documents
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ComplianceCard
                                title="IBAN Proof"
                                type="iban"
                                url={application.documents?.iban}
                                verified={review.verifiedDocs?.iban}
                                onVerify={() => toggleDocumentVerification('iban')}
                                onPreview={setPreviewDoc}
                            />
                            <ComplianceCard
                                title="IRS Declaration"
                                type="irs"
                                url={application.documents?.irs}
                                verified={review.verifiedDocs?.irs}
                                onVerify={() => toggleDocumentVerification('irs')}
                                onPreview={setPreviewDoc}
                            />
                            <ComplianceCard
                                title="Learning Agreement"
                                type="learningAgreement"
                                url={application.documents?.learningAgreement}
                                verified={review.verifiedDocs?.learningAgreement}
                                onVerify={() => toggleDocumentVerification('learningAgreement')}
                                onPreview={setPreviewDoc}
                            />
                        </div>
                    </div>

                    {/* Scored Evaluation */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileBarChart className="w-4 h-4 text-gray-400" />
                            Qualitative Evaluation
                        </h2>
                        <div className="space-y-6">
                            <EvaluationCard
                                title="Motivation Letter"
                                type="motivation"
                                url={application.documents?.motivation}
                                verified={review.verifiedDocs?.motivation}
                                onVerify={() => toggleDocumentVerification('motivation')}
                                score={review.motivation}
                                onScoreChange={(val) => handleScoreChange('motivation', val)}
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="Academic Records"
                                type="records"
                                url={application.documents?.records}
                                verified={review.verifiedDocs?.records}
                                onVerify={() => toggleDocumentVerification('records')}
                                score={review.academic}
                                onScoreChange={(val) => handleScoreChange('academic', val)}
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="Erasmus Presentation"
                                type="presentation"
                                url={application.documents?.presentation}
                                verified={review.verifiedDocs?.presentation}
                                onVerify={() => toggleDocumentVerification('presentation')}
                                score={review.presentation}
                                onScoreChange={(val) => handleScoreChange('presentation', val)}
                                onPreview={setPreviewDoc}
                            />

                            {/* Overall Fit (No doc) */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-esn-orange/10 flex items-center justify-center text-esn-orange">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">Overall Fit & Impression</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex-1 relative h-10 flex items-center">
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full bg-esn-dark-blue"
                                                style={{ width: `${((review.fit || 0) / 25) * 100}%` }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="25"
                                            value={review.fit || 0}
                                            onChange={(e) => handleScoreChange('fit', parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-right w-20">
                                        <span className="text-2xl font-bold text-gray-900 tabular-nums">{review.fit || 0}</span>
                                        <span className="text-gray-400 text-sm font-medium">/25</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section - Moved up */}
            </div>


            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Score</span>
                        <span className="text-3xl font-bold tabular-nums tracking-tight leading-none text-esn-dark-blue">
                            {totalScore}<span className="text-sm text-gray-400 font-normal ml-1">/100</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 font-medium text-right">
                            {verifiedCount} of {totalDocs} checks completed
                        </span>
                        <StatusDropdown
                            status={getReviewStatus(id)}
                            onStatusChange={(newStatus) => updateReview(id, { status: newStatus })}
                        />
                    </div>
                </div>
            </div>

            <DocumentPreviewModal
                url={previewDoc}
                onClose={() => setPreviewDoc(null)}
            />

        </div >
    );
};

export default ReviewView;
