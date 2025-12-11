import Papa from 'papaparse';

export const CSV_FIELD_CONFIG = [
    { key: 'name', label: 'Candidate Name', defaultHeader: 'Nome', required: true },
    { key: 'email', label: 'Email Address', defaultHeader: 'E-mail', required: true },
    { key: 'birthDate', label: 'Birth Date', defaultHeader: 'Data de Nascimento' },
    { key: 'address', label: 'Fiscal Address', defaultHeader: 'Morada Fiscal' },
    { key: 'contact', label: 'Contact Permission', defaultHeader: 'Desejas ser contactado para saber quando abre o nosso recrutamento?' },
    { key: 'gdpr', label: 'GDPR Acceptance', defaultHeader: 'O tratamento de dados é aceite?' },
    { key: 'university', label: 'University', defaultHeader: 'Faculdade/ Universidade que frequentas' },
    { key: 'course', label: 'Course', defaultHeader: 'Curso que frequentas' },
    { key: 'currentYear', label: 'Current Year', defaultHeader: 'Ano em que te encontras' },
    { key: 'applicationYear', label: 'Application/Mobility Year', defaultHeader: 'Ano' },
    { key: 'destinationCity', label: 'Destination City', defaultHeader: 'Cidade e País de Destino' },
    { key: 'destinationCountry', label: 'Destination Country', defaultHeader: 'País' },
    // Documents
    { key: 'proofOfIban', label: 'Proof of IBAN', defaultHeader: 'Identificação do IBAN e do titular da conta para o qual pretende a transferência do valor da bolsa, caso lhe seja atribuída (ficheiro .pdf)' },
    { key: 'motivationLetter', label: 'Motivation Letter', defaultHeader: 'Carta de Motivação ( ficheiro .pdf)' },
    { key: 'transcriptOfRecords', label: 'Transcript of Records', defaultHeader: 'Comprovativo de aproveitamento académico (ficheiro .pdf)' },
    { key: 'learningAgreement', label: 'Learning Agreement', defaultHeader: 'Fotocópia do Learning Agreement assinado ou Carta de Aceitação assinada da instituição de destino (ficheiro .pdf)' },
    { key: 'socialDisadvantageItem', label: 'IRS Declaration', defaultHeader: 'Fotocópia da declaração do IRS correspondente ao ano civil anterior ao início do ano letivo anterior a que se refere a candidatura à bolsa (ficheiro .pdf)' },
    { key: 'presentation', label: 'Presentation', defaultHeader: 'Apresentação Powerpoint/Canva a explicares o porquê de teres escolhido o Programa Erasmus+ e sobre como achas que a mobilidade internacional impacta a vida pessoal, académica e profissional dos jovens (ficheiro .pdf)' }
];

export const parseCSV = (fileOrUrl) => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileOrUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve({
                    data: results.data,
                    meta: results.meta
                });
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

const hashString = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Maps raw CSV data to application objects using a provided column mapping.
 * @param {Array} rawData - Array of objects from Papa Parse
 * @param {string} editionId - The ID of the edition
 * @param {Object} columnMapping - Object where keys are config keys (e.g. 'name') and values are CSV headers
 */
export const mapApplicationData = async (rawData, editionId, columnMapping) => {
    // Validate editionId
    if (!editionId) {
        throw new Error("Edition ID is required for mapping application data");
    }

    if (!columnMapping) {
        throw new Error("Column mapping is required");
    }

    const mappedPromises = rawData.map(async (row, index) => {
        // Helper to get value based on mapping
        const getValue = (key) => {
            const header = columnMapping[key];
            return header && row[header] !== undefined ? row[header] : null;
        };

        const name = getValue('name');
        const emailRaw = getValue('email');

        // Skip empty rows (require at least name or email)
        if (!name && !emailRaw) return null;

        const email = emailRaw ? emailRaw.trim().toLowerCase() : '';
        // Create a unique ID based on email AND edition
        const id = await hashString(`${email}-${editionId}`);

        return {
            id: id,
            editionId: editionId,
            status: 'submitted',
            importedAt: new Date().toISOString(),
            personalInfo: {
                name: name,
                email: emailRaw,
                birthDate: getValue('birthDate'),
                address: getValue('address'),
                contact: getValue('contact'),
                gdpr: getValue('gdpr')
            },
            academicInfo: {
                university: getValue('university'),
                course: getValue('course'),
                currentYear: getValue('currentYear'),
                applicationYear: getValue('applicationYear')
            },
            mobilityInfo: {
                destinationCity: getValue('destinationCity'),
                destinationCountry: (getValue('destinationCountry') || '').trim(),
                semester: null,
                academicYear: getValue('applicationYear') // Often same as valid application year in this context
            },
            financialInfo: {
                iban: null,
                bankAccountOwner: null
            },
            documents: {
                proofOfIban: getValue('proofOfIban'),
                motivationLetter: getValue('motivationLetter'),
                transcriptOfRecords: getValue('transcriptOfRecords'),
                learningAgreement: getValue('learningAgreement'),
                socialDisadvantageItem: getValue('socialDisadvantageItem'),
                presentation: getValue('presentation')
            },
            review: {
                status: 'not_started',
                score: 0,
                comments: []
            }
        };
    });

    const results = await Promise.all(mappedPromises);
    return results.filter(Boolean);
};
