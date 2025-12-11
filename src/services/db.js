import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

export const subscribeToReviews = (callback) => {
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
        const reviewsData = {};
        snapshot.forEach((doc) => {
            reviewsData[doc.id] = doc.data();
        });
        callback(reviewsData);
    });
    return unsubscribe;
};

export const saveReviewToDb = async (applicationId, reviewData) => {
    try {
        const reviewRef = doc(db, 'reviews', String(applicationId));
        await setDoc(reviewRef, {
            ...reviewData,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving review:", error);
        throw error;
    }
};
