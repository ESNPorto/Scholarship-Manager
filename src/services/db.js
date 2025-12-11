import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, arrayUnion, writeBatch, getDocs, where, query } from 'firebase/firestore';

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

// --- Edition Management ---

export const createEdition = async (editionData) => {
    try {
        const editionRef = doc(collection(db, 'editions'));
        const newEdition = {
            id: editionRef.id,
            ...editionData,
            createdAt: new Date().toISOString()
        };
        await setDoc(editionRef, newEdition);
        return newEdition;
    } catch (error) {
        console.error("Error creating edition:", error);
        throw error;
    }
};

export const getEditions = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'editions'));
        const editions = [];
        querySnapshot.forEach((doc) => {
            editions.push(doc.data());
        });
        // Sort by year/semester descending or creation date
        return editions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching editions:", error);
        throw error;
    }
};

// --- Application Management ---

export const batchSaveApplications = async (editionId, applications) => {
    // Firestore batch limit is 500. Splitting just in case.
    const CHUNK_SIZE = 450;
    const chunks = [];

    for (let i = 0; i < applications.length; i += CHUNK_SIZE) {
        chunks.push(applications.slice(i, i + CHUNK_SIZE));
    }

    try {
        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach((app) => {
                const appRef = doc(collection(db, 'applications'), app.id);
                // Ensure editionId is attached
                const appWithEdition = {
                    ...app,
                    editionId: editionId,
                    importedAt: new Date().toISOString()
                };
                batch.set(appRef, appWithEdition, { merge: true });
            });
            await batch.commit();
        }
        console.log(`Successfully imported ${applications.length} applications for edition ${editionId}`);
    } catch (error) {
        console.error("Error batch saving applications:", error);
        throw error;
    }
};

export const getApplicationsByEdition = async (editionId) => {
    try {
        const q = query(
            collection(db, 'applications'),
            where('editionId', '==', editionId)
        );
        const querySnapshot = await getDocs(q);
        const applications = [];
        querySnapshot.forEach((doc) => {
            applications.push(doc.data());
        });
        return applications;
    } catch (error) {
        console.error("Error fetching applications for edition:", error);
        throw error;
    }
};
