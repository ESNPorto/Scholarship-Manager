import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2, Circle, Calendar, MapPin, GraduationCap, Mail, Home, Send, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// --- Helper Components ---

const ComplianceRow = ({ title, url, verified, onVerify }) => {
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
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
                Open
            </a>
        </div>
    );
};

const EvaluationCard = ({ title, url, verified, onVerify, score, onScoreChange, maxScore = 25 }) => {
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
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium transition-colors"
                        style={{ color: '#2e3192' }}
                    >
                        Open Document →
                    </a>
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

const CommentSection = ({ comments = [], onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment('');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</h3>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">No notes yet</p>
                        <p className="text-xs text-gray-400 mt-1">Start the discussion by adding a note below</p>
                    </div>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="flex gap-3 group">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0"></div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(comment.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-start">
                <div className="flex-1 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full min-h-[80px] p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00aeef]/20 focus:border-[#00aeef] text-sm resize-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90 active:scale-95 shadow-sm"
                        style={{ backgroundColor: '#2e3192' }}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Main Component ---

const ReviewView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
            author: 'Me' // In a real app, get from auth context
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

            {/* 2. Compliance Checks (Non-scored docs) */}
            <div className="mb-10">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Compliance Checks</h2>
                <div className="divide-y divide-gray-100">
                    <ComplianceRow
                        title="IBAN & Bank Details"
                        url={application.documents?.iban}
                        verified={review.verifiedDocs?.iban}
                        onVerify={() => toggleDocumentVerification('iban')}
                    />
                    <ComplianceRow
                        title="IRS Declaration"
                        url={application.documents?.irs}
                        verified={review.verifiedDocs?.irs}
                        onVerify={() => toggleDocumentVerification('irs')}
                    />
                    <ComplianceRow
                        title="Learning Agreement"
                        url={application.documents?.learningAgreement}
                        verified={review.verifiedDocs?.learningAgreement}
                        onVerify={() => toggleDocumentVerification('learningAgreement')}
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
                />

                <EvaluationCard
                    title="Academic Records"
                    url={application.documents?.records}
                    verified={review.verifiedDocs?.records}
                    onVerify={() => toggleDocumentVerification('records')}
                    score={review.academic}
                    onScoreChange={(val) => handleScoreChange('academic', val)}
                />

                <EvaluationCard
                    title="Erasmus Presentation"
                    url={application.documents?.presentation}
                    verified={review.verifiedDocs?.presentation}
                    onVerify={() => toggleDocumentVerification('presentation')}
                    score={review.presentation}
                    onScoreChange={(val) => handleScoreChange('presentation', val)}
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

            {/* 4. Comments */}
            <CommentSection
                comments={review.comments}
                onAddComment={handleAddComment}
            />

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

        </div>
    );
};

export default ReviewView;
