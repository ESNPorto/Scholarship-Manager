import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2, Circle, Calendar, MapPin, GraduationCap, Mail, Home, Send, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// --- Helper Components ---

const ComplianceRow = ({ title, url, verified, onVerify }) => {
    if (!url) return null;
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${verified
                ? 'bg-green-50/50 border-green-200'
                : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
        >
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={onVerify}>
                <button className={`flex-shrink-0 transition-colors ${verified ? 'text-green-600' : 'text-gray-300 hover:text-blue-400'}`}>
                    {verified ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />}
                </button>
                <span className={`text-sm font-medium truncate ${verified ? 'text-green-900' : 'text-gray-700'}`}>
                    {title}
                </span>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
            >
                Open <ExternalLink className="w-3 h-3" />
            </a>
        </div>
    );
};

const EvaluationCard = ({ title, url, verified, onVerify, score, onScoreChange, maxScore = 25 }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Document Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onVerify}>
                    <button className={`flex-shrink-0 transition-colors ${verified ? 'text-green-600' : 'text-gray-300 hover:text-blue-400'}`}>
                        {verified ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${verified ? 'text-green-900' : 'text-gray-900'}`}>{title}</span>
                        {verified && <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Verified</span>}
                    </div>
                </div>
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        Open Document <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            {/* Scoring Section */}
            <div className="p-5">
                <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</label>
                    <span className="text-2xl font-bold text-blue-600 tabular-nums">
                        {score || 0}<span className="text-sm text-gray-300 font-normal ml-1">/{maxScore}</span>
                    </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full">
                    <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${((score || 0) / maxScore) * 100}%` }}
                    ></div>
                    <input
                        type="range"
                        min="0"
                        max={maxScore}
                        value={score || 0}
                        onChange={(e) => onScoreChange(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none transition-all duration-300"
                        style={{ left: `calc(${((score || 0) / maxScore) * 100}% - 10px)` }}
                    ></div>
                </div>
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
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Comments & Notes</h3>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500">No comments yet. Start the discussion!</p>
                    </div>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">
                                {comment.author?.[0] || 'U'}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900">{comment.author || 'User'}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(comment.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full min-h-[80px] p-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-y"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

    // --- Handlers ---

    const handleScoreChange = (field, value) => {
        updateReview(activeApplicationId, { [field]: value });
    };

    const toggleDocumentVerification = (docKey) => {
        const verifiedDocs = review.verifiedDocs || {};
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: !verifiedDocs[docKey]
        };
        updateReview(activeApplicationId, { verifiedDocs: newVerifiedDocs });
    };

    const handleAddComment = (text) => {
        const newComment = {
            text,
            timestamp: new Date().toISOString(),
            author: 'Me' // In a real app, get from auth context
        };
        const updatedComments = [...(review.comments || []), newComment];
        updateReview(activeApplicationId, { comments: updatedComments });
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
                    onClick={navigateToDashboard}
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
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getReviewStatus(activeApplicationId) === 'reviewed' ? 'bg-green-50 text-green-700 border-green-200' :
                        getReviewStatus(activeApplicationId) === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {getReviewStatus(activeApplicationId).replace('_', ' ')}
                    </div>
                </div>
            </div>

            {/* 2. Compliance Checks (Non-scored docs) */}
            <div className="mb-8 space-y-4">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" /> Compliance Checks
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
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
            <div className="mb-12 space-y-8">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Evaluation
                </h2>

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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-sm font-bold text-gray-900">Overall Fit & Impression</label>
                        <span className="text-2xl font-bold text-blue-600 tabular-nums">
                            {review.fit || 0}<span className="text-sm text-gray-300 font-normal ml-1">/25</span>
                        </span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full">
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${((review.fit || 0) / 25) * 100}%` }}
                        ></div>
                        <input
                            type="range"
                            min="0"
                            max="25"
                            value={review.fit || 0}
                            onChange={(e) => handleScoreChange('fit', parseInt(e.target.value))}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none transition-all duration-300"
                            style={{ left: `calc(${((review.fit || 0) / 25) * 100}% - 10px)` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 4. Comments */}
            <CommentSection
                comments={review.comments}
                onAddComment={handleAddComment}
            />

            {/* 5. Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Score</span>
                        <span className={`text-3xl font-bold tabular-nums tracking-tight leading-none ${totalScore >= 75 ? 'text-green-600' :
                            totalScore >= 50 ? 'text-blue-600' :
                                'text-orange-500'
                            }`}>
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
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg shadow-green-600/20 active:scale-95 text-sm flex items-center gap-2"
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
