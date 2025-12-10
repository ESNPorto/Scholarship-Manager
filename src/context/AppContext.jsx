import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseCSV, mapApplicationData } from '../utils/csvParser';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [reviews, setReviews] = useState(() => {
        const saved = localStorage.getItem('scholarship_reviews');
        return saved ? JSON.parse(saved) : {};
    });
    const [view, setView] = useState('dashboard'); // 'dashboard', 'review', 'summary'
    const [activeApplicationId, setActiveApplicationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Persist reviews
    useEffect(() => {
        localStorage.setItem('scholarship_reviews', JSON.stringify(reviews));
    }, [reviews]);

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

    const updateReview = (id, reviewData) => {
        setReviews(prev => ({
            ...prev,
            [id]: { ...prev[id], ...reviewData, lastUpdated: new Date().toISOString() }
        }));
    };

    const navigateToReview = (id) => {
        setActiveApplicationId(id);
        setView('review');
    };

    const navigateToDashboard = () => {
        setActiveApplicationId(null);
        setView('dashboard');
    };

    const navigateToSummary = () => {
        setView('summary');
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
            view,
            activeApplicationId,
            isLoading,
            error,
            loadData,
            updateReview,
            navigateToReview,
            navigateToDashboard,
            navigateToSummary,
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
