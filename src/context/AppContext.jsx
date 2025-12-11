import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToReviews, saveReviewToDb, saveCommentToDb, getEditions, getApplicationsByEdition } from '../services/db';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [reviews, setReviews] = useState({});

    // new state for multi-edition
    const [editions, setEditions] = useState([]);
    const [currentEditionId, setCurrentEditionId] = useState(null);
    const [isEditionsLoading, setIsEditionsLoading] = useState(true);

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
        const unsubscribe = subscribeToReviews((newReviews) => {
            setReviews(newReviews);
        });
        return () => unsubscribe();
    }, []);

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
            await saveReviewToDb(id, reviewData);
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
            await saveCommentToDb(id, comment);
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
            getReviewStatus
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
