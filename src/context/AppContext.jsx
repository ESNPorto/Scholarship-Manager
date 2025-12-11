import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseCSV, mapApplicationData } from '../utils/csvParser';
import { subscribeToReviews, saveReviewToDb } from '../services/db';
import defaultDataUrl from '../assets/data.csv?url';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [reviews, setReviews] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Subscribe to reviews from Firestore
    useEffect(() => {
        const unsubscribe = subscribeToReviews((newReviews) => {
            setReviews(newReviews);
        });
        return () => unsubscribe();
    }, []);

    // Auto-load data on mount
    useEffect(() => {
        loadData(defaultDataUrl);
    }, []);

    const loadData = async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            const rawData = await parseCSV(file);
            const mappedData = mapApplicationData(rawData);
            setApplications(mappedData);
        } catch (err) {
            console.error("Error parsing CSV:", err);
            setError("Failed to load data. Please check the CSV format.");
        } finally {
            setIsLoading(false);
        }
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



    const getReviewStatus = (id) => {
        const review = reviews[id];
        if (!review) return 'not_started';
        if (review.status) return review.status;
        // Auto-detect status if scores exist but not explicitly marked?
        // For now, rely on explicit status or 'in_progress' if data exists
        if (Object.keys(review).length > 1) return 'in_progress'; // >1 because lastUpdated is always there
        return 'not_started';
    };

    return (
        <AppContext.Provider value={{
            applications,
            reviews,

            isLoading,
            error,
            loadData,
            updateReview,
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
