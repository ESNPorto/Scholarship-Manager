import React, { useState } from 'react';
import { User } from 'lucide-react';

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
                                    className="px-4 py-2 text-sm font-medium text-white bg-esn-dark-blue rounded-full hover:bg-esn-dark-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-esn-dark-blue to-esn-cyan flex items-center justify-center text-white text-sm font-bold">
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

export default CommentSection;
