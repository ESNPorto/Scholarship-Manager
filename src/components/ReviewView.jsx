import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2, Circle, Calendar, MapPin, GraduationCap, Mail, Home, Send, User, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

// --- Helper Components ---

const ComplianceRow = ({ title, url, verified, onVerify, onPreview }) => {
    if (!url) return null;
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={onVerify}>
                <button className="flex-shrink-0 transition-colors" style={{ color: verified ? '#7ac143' : '#d1d5db' }}>
                    {verified ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className="text-sm font-medium" style={{ color: verified ? '#7ac143' : '#1f2937' }}>
                    {title}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPreview(url)}
                    className="text-sm font-medium transition-colors flex items-center gap-1.5 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
                    style={{ color: '#2e3192' }}
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
            </div>
        </div>
    );
};

const EvaluationCard = ({ title, url, verified, onVerify, score, onScoreChange, maxScore = 25, onPreview }) => {
    return (
        <div className="py-6 border-b border-gray-100 last:border-b-0">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onVerify}>
                    <button className="flex-shrink-0 transition-colors" style={{ color: verified ? '#7ac143' : '#d1d5db' }}>
                        {verified ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <span className="text-base font-semibold text-gray-900">{title}</span>
                </div>
                {url && (
                    <button
                        onClick={() => onPreview(url)}
                        className="text-sm font-medium transition-colors flex items-center gap-1.5 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
                        style={{ color: '#2e3192' }}
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                )}
            </div>

            {/* Slider Row */}
            <div className="flex items-center gap-6">
                <div className="flex-1 relative">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${((score || 0) / maxScore) * 100}%`, backgroundColor: '#2e3192' }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={maxScore}
                        value={score || 0}
                        onChange={(e) => onScoreChange(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <span className="text-2xl font-semibold tabular-nums w-16 text-right" style={{ color: '#f47b20' }}>
                    {score || 0}<span className="text-sm text-gray-300 font-normal">/{maxScore}</span>
                </span>
            </div>
        </div>
    );
};

const CommentSection = ({ comments = [], onAddComment, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment('');
        setIsFocused(false);
    };

    return (
        <div className="max-w-3xl mx-auto mt-8">


            {/* Input Area - YouTube Style (Top) */}
            <div className="flex gap-4 mb-8">
                <div className="flex-shrink-0">
                    {currentUser?.photoURL ? (
                        <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className={`relative transition-all duration-200 ${isFocused ? 'mb-12' : ''}`}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                placeholder="Add a comment..."
                                className="w-full border-b border-gray-200 py-2 bg-transparent focus:border-black focus:outline-none transition-colors placeholder:text-gray-500 text-sm"
                            />
                            <div className={`absolute right-0 top-full mt-2 flex items-center gap-2 transition-all duration-200 origin-top ${isFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFocused(false);
                                        setNewComment('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#065fd4] rounded-full hover:bg-[#065fd4]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    null // Don't show empty state if input is right there, cleaner look
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="flex gap-4 group">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {comment.authorPhoto ? (
                                    <img
                                        src={comment.authorPhoto}
                                        alt={comment.author}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e3192] to-[#00aeef] flex items-center justify-center text-white text-sm font-bold">
                                        {comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {comment.author || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e3192]"></div>
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
        updateReview(id, { verifiedDocs: newVerifiedDocs });
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

    const totalScore = Number(review.motivation || 0) + Number(review.academic || 0) + Number(review.presentation || 0) + Number(review.fit || 0);
    const verifiedCount = Object.values(review.verifiedDocs || {}).filter(Boolean).length;
    const totalDocs = Object.keys(application.documents || {}).length;

    // --- Render ---

    return (
        <div className="max-w-3xl mx-auto pb-32">

            {/* 1. Header & Navigation */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{application.name}</h1>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" /> {application.email}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {application.birthDate}</span>
                            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-gray-400" /> {application.course} @ {application.university} ({application.year})</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {application.destinationCity}</span>
                        </div>
                    </div>
                    <span
                        className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        style={{
                            color: getReviewStatus(id) === 'reviewed' ? '#7ac143'
                                : getReviewStatus(id) === 'in_progress' ? '#f47b20'
                                    : '#9ca3af'
                        }}
                    >
                        {getReviewStatus(id).replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* 2. Comments Section (Moved here) */}
            <div className="mb-10">
                <CommentSection
                    comments={review.comments}
                    onAddComment={handleAddComment}
                    currentUser={currentUser}
                />
            </div>

            {/* 2. Compliance Checks (Non-scored docs) */}
            <div className="mb-10">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Compliance Checks</h2>
                <div className="divide-y divide-gray-100">
                    <ComplianceRow
                        title="IBAN & Bank Details"
                        url={application.documents?.iban}
                        verified={review.verifiedDocs?.iban}
                        onVerify={() => toggleDocumentVerification('iban')}
                        onPreview={setPreviewDoc}
                    />
                    <ComplianceRow
                        title="IRS Declaration"
                        url={application.documents?.irs}
                        verified={review.verifiedDocs?.irs}
                        onVerify={() => toggleDocumentVerification('irs')}
                        onPreview={setPreviewDoc}
                    />
                    <ComplianceRow
                        title="Learning Agreement"
                        url={application.documents?.learningAgreement}
                        verified={review.verifiedDocs?.learningAgreement}
                        onVerify={() => toggleDocumentVerification('learningAgreement')}
                        onPreview={setPreviewDoc}
                    />
                </div>
            </div>

            {/* 3. Evaluation Cards (Scored docs) */}
            <div className="mb-10">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evaluation</h2>

                <EvaluationCard
                    title="Motivation Letter"
                    url={application.documents?.motivation}
                    verified={review.verifiedDocs?.motivation}
                    onVerify={() => toggleDocumentVerification('motivation')}
                    score={review.motivation}
                    onScoreChange={(val) => handleScoreChange('motivation', val)}
                    onPreview={setPreviewDoc}
                />

                <EvaluationCard
                    title="Academic Records"
                    url={application.documents?.records}
                    verified={review.verifiedDocs?.records}
                    onVerify={() => toggleDocumentVerification('records')}
                    score={review.academic}
                    onScoreChange={(val) => handleScoreChange('academic', val)}
                    onPreview={setPreviewDoc}
                />

                <EvaluationCard
                    title="Erasmus Presentation"
                    url={application.documents?.presentation}
                    verified={review.verifiedDocs?.presentation}
                    onVerify={() => toggleDocumentVerification('presentation')}
                    score={review.presentation}
                    onScoreChange={(val) => handleScoreChange('presentation', val)}
                    onPreview={setPreviewDoc}
                />

                {/* Overall Fit (No doc) */}
                <div className="py-6">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-base font-semibold text-gray-900">Overall Fit & Impression</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex-1 relative">
                            <div className="h-1.5 bg-gray-100 rounded-full">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${((review.fit || 0) / 25) * 100}%`, backgroundColor: '#2e3192' }}
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="25"
                                value={review.fit || 0}
                                onChange={(e) => handleScoreChange('fit', parseInt(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <span className="text-2xl font-semibold tabular-nums w-16 text-right" style={{ color: '#f47b20' }}>
                            {review.fit || 0}<span className="text-sm text-gray-300 font-normal">/25</span>
                        </span>
                    </div>
                </div>
            </div>



            {/* 5. Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Score</span>
                        <span className="text-3xl font-bold tabular-nums tracking-tight leading-none" style={{ color: totalScore >= 75 ? '#7ac143' : totalScore >= 50 ? '#2e3192' : '#f47b20' }}>
                            {totalScore}<span className="text-sm text-gray-400 font-normal ml-1">/100</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all active:scale-95 text-sm"
                        >
                            Save Progress
                        </button>
                        <button
                            onClick={handleMarkReviewed}
                            className="px-6 py-2.5 text-white rounded-xl font-semibold transition-all shadow-lg active:scale-95 text-sm flex items-center gap-2"
                            style={{ backgroundColor: '#2e3192', boxShadow: '0 4px 14px rgba(46, 49, 146, 0.25)' }}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Reviewed
                        </button>
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
