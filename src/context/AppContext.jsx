import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToReviews, saveReviewToDb, saveCommentToDb, getEditions, getApplicationsByEdition } from '../services/db';
import { getReviewerStatus } from '../utils/scoring';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [reviews, setReviews] = useState({});

    // new state for multi-edition
    const [editions, setEditions] = useState([]);
    const [currentEditionId, setCurrentEditionId] = useState(null);
    const [isEditionsLoading, setIsEditionsLoading] = useState(true);

    // Reviewer Role State
    const [userRole, setUserRoleState] = useState(() => {
        return localStorage.getItem('scholarship_reviewer_role') || null;
    });

    const setUserRole = (role) => {
        setUserRoleState(role);
        if (role) {
            localStorage.setItem('scholarship_reviewer_role', role);
        } else {
            localStorage.removeItem('scholarship_reviewer_role');
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load Editions on mount
    useEffect(() => {
        const initEditions = async () => {
            try {
                const editionsData = await getEditions();
                setEditions(editionsData);
                if (editionsData.length > 0) {
                    // Default to the most recent one (sorted in db service)
                    const latest = editionsData[0];
                    setCurrentEditionId(latest.id);
                    await loadApplications(latest.id);
                }
            } catch (err) {
                console.error("Failed to load editions:", err);
                setError("Failed to load editions.");
            } finally {
                setIsEditionsLoading(false);
            }
        };
        initEditions();
    }, []);

    // Subscribe to reviews from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToReviews(currentEditionId, (newReviews) => {
            setReviews(newReviews);
        });
        return () => unsubscribe();
    }, [currentEditionId]);

    const loadApplications = async (editionId) => {
        setIsLoading(true);
        setError(null);
        try {
            const rawApps = await getApplicationsByEdition(editionId);
            // Map Firestore nested structure to flat structure expected by UI
            const apps = rawApps.map(app => ({
                ...app,
                // Flatten Personal Info
                name: app.personalInfo?.name || app.name || 'Unknown',
                email: app.personalInfo?.email || app.email || '',

                // Flatten Academic Info
                university: app.academicInfo?.university || app.university || '',
                course: app.academicInfo?.course || app.course || '',

                // Flatten Mobility Info
                destinationCity: app.mobilityInfo?.destinationCity || app.destinationCity || '',
                destinationCountry: app.mobilityInfo?.destinationCountry || app.destinationCountry || '',
                semester: app.mobilityInfo?.semester || app.semester || '',
                academicYear: app.mobilityInfo?.academicYear || app.academicYear || '',
            }));

            setApplications(apps);
        } catch (err) {
            console.error("Error loading applications:", err);
            setError("Failed to load applications for this edition.");
        } finally {
            setIsLoading(false);
        }
    };

    const switchEdition = async (editionId) => {
        if (editionId === currentEditionId) return;
        setCurrentEditionId(editionId);
        await loadApplications(editionId);
    };

    const updateReview = async (id, reviewData) => {
        // Optimistic update
        setReviews(prev => ({
            ...prev,
            [id]: { ...prev[id], ...reviewData, lastUpdated: new Date().toISOString() }
        }));

        // Save to DB
        try {
            await saveReviewToDb(id, reviewData, currentEditionId);
        } catch (err) {
            console.error("Failed to save review to DB:", err);
            // Revert or show error? For now just log.
        }
    };


    const addReviewComment = async (id, comment) => {
        // Optimistic update
        setReviews(prev => {
            const currentReview = prev[id] || {};
            const currentComments = currentReview.comments || [];
            return {
                ...prev,
                [id]: {
                    ...currentReview,
                    comments: [...currentComments, comment],
                    lastUpdated: new Date().toISOString()
                }
            };
        });

        // Save to DB
        try {
            await saveCommentToDb(id, comment, currentEditionId);
        } catch (err) {
            console.error("Failed to save comment to DB:", err);
            // In a real app we might want to revert the optimistic update or show a toast
        }
    };

    const getReviewStatus = (id) => {
        const review = reviews[id];
        if (!review) return 'not_started';
        if (review.status) return review.status;
        // Auto-detect status if scores exist but not explicitly marked?
        // For now, rely on explicit status or 'in_progress' if data exists
        if (Object.keys(review).length > 1) return 'in_progress'; // >1 because lastUpdated is always there
        return 'not_started';
    };

    const refreshEditions = async () => {
        const editionsData = await getEditions();
        setEditions(editionsData);
        // If we didn't have a selected edition (e.g. first run), select the new one
        if (!currentEditionId && editionsData.length > 0) {
            const latest = editionsData[0];
            setCurrentEditionId(latest.id);
            await loadApplications(latest.id);
        }
    };

    // --- Review Session Logic ---
    const [reviewSession, setReviewSession] = useState(() => {
        const saved = localStorage.getItem('scholarship_review_session');
        return saved ? JSON.parse(saved) : { isActive: false, role: null, queue: [], currentIndex: 0, stats: { total: 0, completed: 0 } };
    });

    useEffect(() => {
        if (reviewSession.isActive) {
            localStorage.setItem('scholarship_review_session', JSON.stringify(reviewSession));
        } else {
            localStorage.removeItem('scholarship_review_session');
        }
    }, [reviewSession]);

    const startReviewSession = (role) => {
        if (!role || !applications.length) return;

        // Filter applications pending for this role
        // 1. Not fully reviewed by this role
        // 2. Not discarded (unless explicitly included, but for now exclude)
        // 3. Sort by priority: In Progress > Not Started. Then by date/id.

        const pendingApps = applications.filter(app => {
            const review = reviews[app.id] || {};

            // Check if discarded globally
            if (review.status === 'discarded') return false;

            // Check if already completed by this user
            // We use getReviewerStatus helper logic here inline or import it
            // For now, strict check on the sub-field
            const isDone = review[reviewFieldMap[role]] && review[reviewFieldMap[role]].status === 'completed';
            // Wait, the data structure is: review.motivation.president (score)
            // Let's rely on existence of score for now as "done" is complex with partial saves
            // Actually, let's use the helper if we can, or just check if score exists

            // Simpler approach for MVP:
            // If role is president, check review.motivation.president AND review.presentation.president have values?
            // "Done" is hard to define perfectly without a flag. 
            // Let's look for "missing score" in any required component.

            // Helpers
            const hasScore = (section) => review[section] && review[section][role] !== undefined && review[section][role] !== '';

            const motivationDone = hasScore('motivation');
            const presentationDone = hasScore('presentation');

            // IRS/Records are shared, usually handled by specific roles but simplified here:
            // If I am President, I need to do Mot + Pres.
            // If I am EO, I need to do Mot + Pres.
            // If I am CF, I need to do Mot + Pres.

            return !(motivationDone && presentationDone);
        });

        if (pendingApps.length === 0) {
            alert("No pending applications for your role!");
            return;
        }

        // Sort: In Progress first
        pendingApps.sort((a, b) => {
            const getStatusRec = (id) => reviews[id] ? 1 : 0; // Rough 'touched' check
            return getStatusRec(b.id) - getStatusRec(a.id);
        });

        const queue = pendingApps.map(app => app.id);

        setReviewSession({
            isActive: true,
            role, // Save the role
            queue,
            currentIndex: 0,
            startTime: Date.now(),
            stats: { total: queue.length, completed: 0 }
        });

        return queue[0]; // Return first ID to navigate
    };

    const reviewFieldMap = {
        'president': 'president',
        'eo': 'eo',
        'cf': 'cf'
    };

    const endReviewSession = () => {
        setReviewSession({ isActive: false, role: null, queue: [], currentIndex: 0, stats: { total: 0, completed: 0 } });
    };

    const nextApplication = () => {
        if (!reviewSession.isActive) return null;
        if (reviewSession.currentIndex < reviewSession.queue.length - 1) {
            const newIndex = reviewSession.currentIndex + 1;
            setReviewSession(prev => ({ ...prev, currentIndex: newIndex })); // Update index
            return reviewSession.queue[newIndex];
        } else {
            return 'finished'; // Signal end of queue
        }
    };

    const previousApplication = () => {
        if (!reviewSession.isActive) return null;
        if (reviewSession.currentIndex > 0) {
            const newIndex = reviewSession.currentIndex - 1;
            setReviewSession(prev => ({ ...prev, currentIndex: newIndex }));
            return reviewSession.queue[newIndex];
        }
        return null;
    };

    // Jump to specific index (useful for seeking)
    const jumpToApplication = (index) => {
        if (!reviewSession.isActive) return null;
        if (index >= 0 && index < reviewSession.queue.length) {
            setReviewSession(prev => ({ ...prev, currentIndex: index }));
            return reviewSession.queue[index];
        }
        return null; // Return null if invalid index
    };

    const resumeSession = () => {
        if (!reviewSession.isActive || !userRole) return null;

        const checkIsReviewed = (appId) => {
            const review = reviews[appId];
            return getReviewerStatus(review, userRole);
        };

        let nextIndex = reviewSession.currentIndex;

        while (nextIndex < reviewSession.queue.length && checkIsReviewed(reviewSession.queue[nextIndex])) {
            nextIndex++;
        }

        if (nextIndex >= reviewSession.queue.length) {
        }

        if (nextIndex !== reviewSession.currentIndex) {
            setReviewSession(prev => ({ ...prev, currentIndex: nextIndex }));
        }

        if (nextIndex < reviewSession.queue.length) {
            return reviewSession.queue[nextIndex];
        } else {
            return 'finished';
        }
    };



    return (
        <AppContext.Provider value={{
            applications,
            reviews,
            editions,
            currentEditionId,
            isEditionsLoading,
            switchEdition,
            refreshEditions,
            loadApplications, // Exposed for manual reload after import

            isLoading,
            error,
            updateReview,
            addReviewComment,
            getReviewStatus,
            userRole,
            setUserRole,

            // Review Session
            reviewSession,
            startReviewSession,
            endReviewSession,
            nextApplication,
            previousApplication,
            jumpToApplication,
            resumeSession
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
