import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, arrayUnion } from 'firebase/firestore';

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

export const saveCommentToDb = async (applicationId, comment) => {
    try {
        const reviewRef = doc(db, 'reviews', String(applicationId));
        // Use arrayUnion to atomically add the comment
        await setDoc(reviewRef, {
            comments: arrayUnion(comment),
            lastUpdated: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving comment:", error);
        throw error;
    }
};
