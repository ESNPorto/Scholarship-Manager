export const calculateScore = (review) => {
    return ['motivation', 'academic', 'presentation', 'fit']
        .reduce((sum, key) => sum + Number(review?.[key] || 0), 0);
};
