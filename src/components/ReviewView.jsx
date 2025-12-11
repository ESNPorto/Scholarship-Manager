import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, CheckCircle2, Circle, Calendar, MapPin, GraduationCap, Mail, Home, Send, User, Clock, ChevronDown, ChevronUp, Eye, FileCheck, FileBarChart, Mic, CreditCard, FileSpreadsheet } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

// --- Helper Components ---

const DocumentIcon = ({ type }) => {
    // All icons use ESN Dark Blue for simplicity and consistency
    const iconColor = "text-[#2e3192]";

    switch (type) {
        case 'iban': return <CreditCard className={`w-6 h-6 ${iconColor}`} />;
        case 'irs': return <FileSpreadsheet className={`w-6 h-6 ${iconColor}`} />;
        case 'learningAgreement': return <FileCheck className={`w-6 h-6 ${iconColor}`} />;
        case 'motivation': return <FileText className={`w-6 h-6 ${iconColor}`} />;
        case 'records': return <FileBarChart className={`w-6 h-6 ${iconColor}`} />;
        case 'presentation': return <Mic className={`w-6 h-6 ${iconColor}`} />;
        default: return <FileText className={`w-6 h-6 ${iconColor}`} />;
    }
};

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
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${verified ? 'bg-[#7ac143]/10 text-[#7ac143]' : 'bg-gray-100 text-gray-400 hover:bg-[#7ac143]/10 hover:text-[#7ac143]'}`}
                >
                    {verified ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
};

const EvaluationCard = ({ title, url, verified, onVerify, score, onScoreChange, maxScore = 25, onPreview, type }) => {
    const getScoreLabel = (s, max) => {
        const pct = s / max;
        if (pct < 0.4) return 'Poor';
        if (pct < 0.7) return 'Fair';
        if (pct < 0.9) return 'Good';
        return 'Excellent';
    };

    const label = getScoreLabel(score || 0, maxScore);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2e3192]/5">
                        <DocumentIcon type={type} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        {url ? (
                            <button onClick={() => onPreview(url)} className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                                <Eye className="w-3.5 h-3.5" /> View Document
                            </button>
                        ) : (
                            <span className="text-sm text-gray-400 italic">No document attached</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onVerify}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${verified ? 'bg-[#7ac143]/10 text-[#7ac143]' : 'bg-gray-100 text-gray-400 hover:bg-[#7ac143]/10 hover:text-[#7ac143]'}`}
                >
                    {verified ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            </div>

            {/* Scoring Area */}
            <div className="p-5 bg-gray-50/50 rounded-b-xl">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Score</span>
                    <div className="text-right">
                        <span className="text-sm font-bold mr-2 text-[#2e3192]">{label}</span>
                        <span className="text-2xl font-bold text-gray-900 tabular-nums">{score || 0}</span>
                        <span className="text-gray-400 text-sm font-medium">/{maxScore}</span>
                    </div>
                </div>

                <div className="relative h-10 flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 rounded-full bg-[#2e3192]"
                            style={{ width: `${((score || 0) / maxScore) * 100}%` }}
                        />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={maxScore}
                        value={score || 0}
                        onChange={(e) => onScoreChange(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Tick marks could go here */}
                </div>
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
        <div className="mt-8">
            {/* Input Area */}
            <div className="flex gap-4 mb-8">
                <div className="flex-shrink-0">
                    {currentUser?.photoURL ? (
                        <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
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
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#2e3192] rounded-full hover:bg-[#2e3192]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                {comments.map((comment, index) => (
                    <div key={index} className="flex gap-4 group">
                        <div className="flex-shrink-0">
                            {comment.authorPhoto ? (
                                <img
                                    src={comment.authorPhoto}
                                    alt={comment.author}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e3192] to-[#00aeef] flex items-center justify-center text-white text-sm font-bold">
                                    {comment.author ? comment.author.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
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
                ))}
            </div>
        </div>
    );
};

const StatusDropdown = ({ status, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { value: 'not_started', label: 'Not Started', color: '#f3f4f6', textColor: '#6b7280', borderColor: '#e5e7eb' },
        { value: 'in_progress', label: 'In Progress', color: '#f47b20', textColor: '#ffffff', borderColor: '#f47b20' },
        { value: 'reviewed', label: 'Reviewed', color: '#7ac143', textColor: '#ffffff', borderColor: '#7ac143' }
    ];

    const currentOption = options.find(o => o.value === status) || options[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#2e3192] whitespace-nowrap min-w-[160px]"
                style={{
                    backgroundColor: currentOption.color,
                    color: currentOption.textColor,
                    borderColor: currentOption.borderColor
                }}
            >
                {currentOption.label}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onStatusChange(option.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 group"
                        >
                            <div
                                className="w-2 h-2 rounded-full transition-transform group-hover:scale-110"
                                style={{ backgroundColor: option.value === 'not_started' ? '#9ca3af' : option.borderColor }}
                            />
                            <span className="text-gray-700">{option.label}</span>
                            {status === option.value && <CheckCircle2 className="w-4 h-4 ml-auto text-[#2e3192]" />}
                        </button>
                    ))}
                </div>
            )}
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
                    className="h-full bg-[#2e3192] transition-all duration-500"
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
                                <span className="px-3 py-1 rounded-full bg-[#2e3192]/10 text-[#2e3192] font-medium flex items-center gap-1.5">
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
                                        <div className="w-10 h-10 rounded-lg bg-[#f47b20]/10 flex items-center justify-center text-[#f47b20]">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">Overall Fit & Impression</h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex-1 relative h-10 flex items-center">
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full bg-[#2e3192]"
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
                        <span className="text-3xl font-bold tabular-nums tracking-tight leading-none" style={{ color: '#2e3192' }}>
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
