import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCheck, FileBarChart, User, GraduationCap, MapPin, Home, ShieldCheck, ShieldAlert, Mail, Calendar, Building, Map } from 'lucide-react';
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
        isLoading,
        isEditionsLoading
    } = useApp();

    const application = applications.find(app => String(app.id) === id);
    const review = reviews[id] || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading || isEditionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esn-dark-blue"></div>
            </div>
        );
    }

    if (!application) return <div>Application not found</div>;

    // --- Handlers ---

    const handleScoreChange = (field, value, subField = null) => {
        let updates = {};
        let shouldAutoVerify = false;

        if (subField) {
            // Handle nested updates (e.g. motivation.president)
            const currentFieldData = review[field] || {};

            // If just updating the score, we also want to track WHO did it
            // Only specific subFields (president, eo, cf) should be tracked this way
            const fieldUpdates = {
                ...currentFieldData,
                [subField]: value
            };

            // Add metadata if user is logged in
            if (currentUser && ['president', 'eo', 'cf'].includes(subField)) {
                fieldUpdates[`${subField}By`] = currentUser.uid;
                fieldUpdates[`${subField}At`] = new Date().toISOString();
            }

            updates[field] = fieldUpdates;

            // Check if all sub-fields are filled to auto-verify
            // We treat 0 as a valid score, so check for undefined/null/empty string
            const isValid = (val) => val !== undefined && val !== null && val !== '';

            // Check based on known subfields for these types
            const hasPresident = isValid(fieldUpdates.president);
            const hasEO = isValid(fieldUpdates.eo);
            const hasCF = isValid(fieldUpdates.cf);

            if (hasPresident && hasEO && hasCF) {
                shouldAutoVerify = true;
            }

        } else {
            updates[field] = value;
            // Auto-verify single field if value is valid
            if (value !== undefined && value !== null && value !== '') {
                shouldAutoVerify = true;
            }
        }

        // Apply Auto-Verification if conditions met
        if (shouldAutoVerify) {
            const currentVerifiedDocs = review.verifiedDocs || {};

            // Map scoring field to verification key
            let verificationKey = field;
            if (field === 'academic') {
                verificationKey = 'records';
            }

            // Only update if not already verified to verify it
            if (!currentVerifiedDocs[verificationKey]) {
                const newVerifiedDocs = {
                    ...currentVerifiedDocs,
                    [verificationKey]: true
                };
                updates.verifiedDocs = newVerifiedDocs;

                // Also check if this completes the entire review
                const hasCitizenCard = !!application.documents?.citizenCard;
                const requiredTotal = hasCitizenCard ? 7 : 6;
                const newVerifiedCount = Object.values(newVerifiedDocs).filter(Boolean).length;

                if (newVerifiedCount === requiredTotal) {
                    updates.status = 'reviewed';
                    updates.valid = true;
                } else if (getReviewStatus(id) === 'not_started') {
                    updates.status = 'in_progress';
                    updates.valid = true;
                }
            }
        }

        updateReview(id, updates);
    };

    const toggleDocumentVerification = (docKey) => {
        const verifiedDocs = review.verifiedDocs || {};
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: !verifiedDocs[docKey]
        };

        const updates = { verifiedDocs: newVerifiedDocs };

        // Auto-update status to 'reviewed' if all checks are complete
        // Dynamic total based on whether citizen card exists
        const hasCitizenCard = !!application.documents?.citizenCard;
        const requiredTotal = hasCitizenCard ? 7 : 6;

        const newVerifiedCount = Object.values(newVerifiedDocs).filter(Boolean).length;
        if (newVerifiedCount === requiredTotal) {
            updates.status = 'reviewed';
            updates.valid = true;
        } else if (getReviewStatus(id) === 'not_started') {
            updates.status = 'in_progress';
            updates.valid = true;
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
    // Dynamic total docs
    const hasCitizenCard = !!application.documents?.citizenCard;
    const totalDocs = hasCitizenCard ? 7 : 6;
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
                    <div className="flex items-start justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">{application.name}</h1>
                            {/* Primary Tags (Course, Location, Uni) */}
                            <div className="flex flex-wrap gap-3 text-sm mb-3">
                                <span className="px-3 py-1 rounded-full bg-esn-dark-blue/10 text-esn-dark-blue font-medium flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" /> {application.course}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" /> {application.mobilityInfo?.destinationCity}{application.mobilityInfo?.destinationCountry ? `, ${application.mobilityInfo.destinationCountry}` : ''}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                    <Home className="w-4 h-4" /> {application.academicInfo?.university}
                                </span>
                                {application.mobilityInfo?.destinationUniversity && (
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                        <Building className="w-4 h-4" /> Host: {application.mobilityInfo.destinationUniversity}
                                    </span>
                                )}
                            </div>

                            {/* Secondary Tags (Personal & Details) */}
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> {application.personalInfo?.email}
                                </span>
                                {application.personalInfo?.birthDate && (
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" /> {application.personalInfo.birthDate}
                                    </span>
                                )}
                                {application.academicInfo?.currentYear && (
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                        <User className="w-4 h-4" /> Year: {application.academicInfo.currentYear}
                                    </span>
                                )}
                                {application.personalInfo?.address && (
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1.5">
                                        <Map className="w-4 h-4" /> {application.personalInfo.address}
                                    </span>
                                )}
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
                                        onChange={() => {
                                            const isCurrentlyValid = review.valid !== false;
                                            if (isCurrentlyValid) {
                                                // Making it INVALID
                                                updateReview(id, { valid: false, status: 'discarded' });
                                            } else {
                                                // Making it VALID
                                                updateReview(id, { valid: true, status: 'not_started' });
                                            }
                                        }}
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
                                url={application.documents?.iban || application.documents?.proofOfIban}
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
                            {application.documents?.citizenCard && (
                                <ComplianceCard
                                    title="Citizen Card"
                                    type="citizenCard"
                                    url={application.documents.citizenCard}
                                    verified={review.verifiedDocs?.citizenCard}
                                    onVerify={() => toggleDocumentVerification('citizenCard')}
                                    onPreview={setPreviewDoc}
                                />
                            )}
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
                                url={application.documents?.motivation || application.documents?.motivationLetter}
                                verified={review.verifiedDocs?.motivation}
                                onVerify={() => toggleDocumentVerification('motivation')}
                                scores={review.motivation || {}}
                                onScoreChange={(role, val) => handleScoreChange('motivation', val, role)}
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="Academic Records"
                                type="records"
                                url={application.documents?.records || application.documents?.transcriptOfRecords}
                                verified={review.verifiedDocs?.records}
                                onVerify={() => toggleDocumentVerification('records')}
                                score={review.academic}
                                onScoreChange={(val) => handleScoreChange('academic', val)}
                                maxScore={20}
                                onPreview={setPreviewDoc}
                            />

                            <EvaluationCard
                                title="IRS Declaration"
                                type="irs"
                                url={application.documents?.irs || application.documents?.socialDisadvantageItem}
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
                            onStatusChange={(newStatus) => {
                                const updates = { status: newStatus };
                                if (newStatus === 'discarded') {
                                    updates.valid = false;
                                } else {
                                    updates.valid = true;
                                }
                                updateReview(id, updates);
                            }}
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
