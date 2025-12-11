import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, arrayUnion, writeBatch, getDocs, where, query } from 'firebase/firestore';

export const subscribeToReviews = (editionId, callback) => {
    if (!editionId) return () => {};

    const q = query(
        collection(db, 'reviews'), 
        where('editionId', '==', editionId)
    );

    return onSnapshot(q, (snapshot) => {
        const reviewsData = {};
        snapshot.forEach((doc) => {
            reviewsData[doc.id] = doc.data();
        });
        callback(reviewsData);
    });
};

export const saveReviewToDb = async (applicationId, reviewData, editionId) => {
    try {
        const reviewRef = doc(db, 'reviews', String(applicationId));
        const dataToSave = {
            ...reviewData,
            lastUpdated: new Date().toISOString()
        };
        if (editionId) {
            dataToSave.editionId = editionId;
        }
        await setDoc(reviewRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving review:", error);
        throw error;
    }
};

export const saveCommentToDb = async (applicationId, comment, editionId) => {
    try {
        const reviewRef = doc(db, 'reviews', String(applicationId));
        // Use arrayUnion to atomically add the comment
        const dataToSave = {
            comments: arrayUnion(comment),
            lastUpdated: new Date().toISOString()
        };
        if (editionId) {
            dataToSave.editionId = editionId;
        }
        await setDoc(reviewRef, dataToSave, { merge: true });
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

export const updateEdition = async (editionId, editionData) => {
    try {
        const editionRef = doc(db, 'editions', editionId);
        await updateDoc(editionRef, {
            ...editionData,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating edition:", error);
        throw error;
    }
};

export const deleteEdition = async (editionId) => {
    try {
        const editionRef = doc(db, 'editions', editionId);
        await deleteDoc(editionRef);
    } catch (error) {
        console.error("Error deleting edition:", error);
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
                const { review, ...appData } = app;
                const appWithEdition = {
                    ...appData,
                    editionId: editionId,
                    importedAt: new Date().toISOString()
                };
                batch.set(appRef, appWithEdition, { merge: true });

                // Also save initial review state to reviews collection
                if (review) {
                    const reviewRef = doc(collection(db, 'reviews'), app.id);
                    batch.set(reviewRef, {
                        ...review,
                        editionId: editionId,
                        lastUpdated: new Date().toISOString()
                    }, { merge: true });
                }
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
