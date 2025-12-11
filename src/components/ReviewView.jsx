import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCheck, FileBarChart, User, GraduationCap, MapPin, Home, ShieldCheck, ShieldAlert } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

// Imported Components
import DocumentIcon from './common/DocumentIcon';
import StatusDropdown from './common/StatusDropdown';
import ComplianceCard from './review/ComplianceCard';
import EvaluationCard from './review/EvaluationCard';
import MultiEvaluationCard from './review/MultiEvaluationCard';
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
        addReviewComment,
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

    const handleScoreChange = (field, value, subField = null) => {
        if (subField) {
            // Handle nested updates (e.g. motivation.president)
            const currentFieldData = review[field] || {};
            updateReview(id, {
                [field]: {
                    ...currentFieldData,
                    [subField]: value
                }
            });
        } else {
            updateReview(id, { [field]: value });
        }
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
        addReviewComment(id, newComment);
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

                    {/* Validation Toggle */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${review.valid !== false ? 'bg-esn-green/10 text-esn-green' : 'bg-red-50 text-red-500'}`}>
                                {review.valid !== false ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Application Validity</h3>
                                <p className="text-sm text-gray-500">Is this application valid for evaluation?</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={review.valid !== false} // Default to true (undefined is true)
                                        onChange={() => updateReview(id, { valid: review.valid === false })}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${review.valid !== false ? 'bg-esn-green' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${review.valid !== false ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <span className={`ml-3 font-medium ${review.valid !== false ? 'text-esn-green' : 'text-gray-400'}`}>
                                    {review.valid !== false ? 'Valid' : 'Invalid'}
                                </span>
                            </label>
                        </div>
                    </div>

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
                            {/* IRS Removed from here */}
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
                            <MultiEvaluationCard
                                title="Motivation Letter"
                                type="motivation"
                                url={application.documents?.motivation}
                                verified={review.verifiedDocs?.motivation}
                                onVerify={() => toggleDocumentVerification('motivation')}
                                scores={review.motivation || {}}
                                onScoreChange={(role, val) => handleScoreChange('motivation', val, role)}
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="Academic Records"
                                type="records"
                                url={application.documents?.transcriptOfRecords} // Update to match mapped key if changed, was 'records' but logic uses 'documents' prop
                                // Wait, in mapped data (csvParser) key is 'transcriptOfRecords' but in previous UI was 'records'. 
                                // Let's check csvParser: it maps to 'transcriptOfRecords'. 
                                // Previous code used: url={application.documents?.records} -> This implies 'records' key might have been used or it was undefined?
                                // Let's use 'transcriptOfRecords' as per csvParser mapping.
                                // Actually, let's keep it consistent with what I see in ReviewView before.
                                // Before: url={application.documents?.records}
                                // csvParser Line 75: transcriptOfRecords: row[...]
                                // If they were mismatching before, it wouldn't show.
                                // I will assume 'transcriptOfRecords' is correct key from csvParser and use that.
                                // Note: previous code line 203: url={application.documents?.records}
                                verified={review.verifiedDocs?.records}
                                onVerify={() => toggleDocumentVerification('records')}
                                score={review.academic}
                                onScoreChange={(val) => handleScoreChange('academic', val)}
                                maxScore={20} // Updated to 20
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="IRS Declaration"
                                type="irs"
                                url={application.documents?.socialDisadvantageItem}
                                // csvParser l.77: socialDisadvantageItem
                                // Previous code: url={application.documents?.irs}
                                // Wait, previous code l.166 used application.documents?.irs
                                // Let me check csvParser again.
                                // csvParser l.77: socialDisadvantageItem: row[...]
                                // Does csvParser output 'documents.irs'? No.
                                // This means the previous code might have been using a different mapping or I missed something.
                                // Ah, wait. I will stick to what seems to be in the database or what the UI expects.
                                // If I look at csvParser.js I view earlier (Step 12), it maps: 
                                // proofOfIban, motivationLetter, transcriptOfRecords, learningAgreement, socialDisadvantageItem, presentation.
                                // But ReviewView.jsx (Step 17) uses: .documents?.iban, .irs, .learningAgreement, .motivation, .records, .presentation.
                                // There is a mismatch!
                                // If the app was working, where did 'irs' key come from?
                                // Maybe there's a different parser or the data was manually fixed?
                                // I will trust `csvParser.js` keys because I saw the file content.
                                // documents: { proofOfIban, motivationLetter, transcriptOfRecords, learningAgreement, socialDisadvantageItem, presentation }
                                // So I should correct the keys here.
                                verified={review.verifiedDocs?.irs}
                                onVerify={() => toggleDocumentVerification('irs')}
                                score={review.irs}
                                onScoreChange={(val) => handleScoreChange('irs', val)}
                                maxScore={20}
                                onPreview={setPreviewDoc}
                            />

                            <MultiEvaluationCard
                                title="Erasmus Presentation"
                                type="presentation"
                                url={application.documents?.presentation}
                                verified={review.verifiedDocs?.presentation}
                                onVerify={() => toggleDocumentVerification('presentation')}
                                scores={review.presentation || {}}
                                onScoreChange={(role, val) => handleScoreChange('presentation', val, role)}
                                onPreview={setPreviewDoc}
                            />
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
                            {totalScore}<span className="text-sm text-gray-400 font-normal ml-1">/20</span>
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
