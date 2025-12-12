export const calculateScore = (review) => {
    if (!review) return 0;

    const getAverage = (scoreObj) => {
        if (!scoreObj) return 0;
        // If it's a number (legacy), return it (normalized to 20 if needed? No, assuming reset). 
        // Actually, let's treat number as 0 to avoid breaking. Or just check type.
        if (typeof scoreObj === 'number') return scoreObj;

        const { president = 0, eo = 0, cf = 0 } = scoreObj;
        return (president + eo + cf) / 3;
    };

    const motivationAvg = getAverage(review.motivation);
    const presentationAvg = getAverage(review.presentation);
    const academic = Number(review.academic) || 0;
    const irs = Number(review.irs) || 0;

    // Formula: (Mot + Pres + Acad + IRS) / 4
    const total = (motivationAvg + presentationAvg + academic + irs) / 4;

    return Math.round(total); // Return rounded integer as per requirement
};

// Check if a specific reviewer role has completed their part
// Roles: 'president', 'eo', 'cf'
export const getReviewerStatus = (review, role) => {
    if (!review || !role) return false;

    // Check if score exists for this role in both multi-reviewer fields
    const hasMotivation = hasScore(review.motivation, role);
    const hasPresentation = hasScore(review.presentation, role);

    return hasMotivation && hasPresentation;
};

// Helper to check if a score exists for a role
const hasScore = (fieldData, role) => {
    if (!fieldData) return false;
    // Check if the role property exists and is a number (0 is a valid score)
    return typeof fieldData[role] === 'number';
};
