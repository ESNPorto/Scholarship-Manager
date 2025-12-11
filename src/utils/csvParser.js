import Papa from 'papaparse';

export const CSV_FIELD_CONFIG = [
    { key: 'name', label: 'Candidate Name', defaultHeader: 'Nome', required: true, path: 'personalInfo.name', type: 'text' },
    { key: 'email', label: 'Email Address', defaultHeader: 'E-mail', required: true, path: 'personalInfo.email', type: 'text' },
    { key: 'birthDate', label: 'Birth Date', defaultHeader: 'Data de Nascimento', path: 'personalInfo.birthDate', type: 'text' },
    { key: 'address', label: 'Fiscal Address', defaultHeader: 'Morada Fiscal', path: 'personalInfo.address', type: 'text' },
    { key: 'contact', label: 'Contact Permission', defaultHeader: 'Desejas ser contactado para saber quando abre o nosso recrutamento?', path: 'personalInfo.contact', type: 'text' },
    { key: 'gdpr', label: 'GDPR Acceptance', defaultHeader: 'O tratamento de dados é aceite?', path: 'personalInfo.gdpr', type: 'text' },
    { key: 'university', label: 'University', defaultHeader: 'Faculdade/ Universidade que frequentas', path: 'academicInfo.university', type: 'text' },
    { key: 'course', label: 'Course', defaultHeader: 'Curso que frequentas', path: 'academicInfo.course', type: 'text' },
    { key: 'currentYear', label: 'Current Year', defaultHeader: 'Ano em que te encontras', path: 'academicInfo.currentYear', type: 'text' },
    { key: 'applicationYear', label: 'Application/Mobility Year', defaultHeader: 'Ano', path: 'academicInfo.applicationYear', type: 'text' },
    { key: 'destinationCity', label: 'Destination City', defaultHeader: 'Cidade e País de Destino', path: 'mobilityInfo.destinationCity', type: 'text' },
    { key: 'destinationCountry', label: 'Destination Country', defaultHeader: 'País', path: 'mobilityInfo.destinationCountry', type: 'text' },
    { key: 'destinationUniversity', label: 'Destination University', defaultHeader: 'Universidade de Destino', path: 'mobilityInfo.destinationUniversity', type: 'text' },
    // Documents
    { key: 'citizenCard', label: 'Citizen Card / Passport', defaultHeader: 'Fotocópia do Cartão de Cidadão/ Bilhete de Identidade ou Passaporte (ficheiro .pdf)', path: 'documents.citizenCard', type: 'link' },
    { key: 'iban', label: 'Proof of IBAN', defaultHeader: 'Identificação do IBAN e do titular da conta para o qual pretende a transferência do valor da bolsa, caso lhe seja atribuída (ficheiro .pdf)', path: 'documents.iban', type: 'link' },
    { key: 'motivation', label: 'Motivation Letter', defaultHeader: 'Carta de Motivação ( ficheiro .pdf)', path: 'documents.motivation', type: 'link' },
    { key: 'records', label: 'Transcript of Records', defaultHeader: 'Comprovativo de aproveitamento académico (ficheiro .pdf)', path: 'documents.records', type: 'link' },
    { key: 'learningAgreement', label: 'Learning Agreement', defaultHeader: 'Fotocópia do Learning Agreement assinado ou Carta de Aceitação assinada da instituição de destino (ficheiro .pdf)', path: 'documents.learningAgreement', type: 'link' },
    { key: 'irs', label: 'IRS Declaration', defaultHeader: 'Fotocópia da declaração do IRS correspondente ao ano civil anterior ao início do ano letivo anterior a que se refere a candidatura à bolsa (ficheiro .pdf)', path: 'documents.irs', type: 'link' },
    { key: 'presentation', label: 'Presentation', defaultHeader: 'Apresentação Powerpoint/Canva a explicares o porquê de teres escolhido o Programa Erasmus+ e sobre como achas que a mobilidade internacional impacta a vida pessoal, académica e profissional dos jovens (ficheiro .pdf)', path: 'documents.presentation', type: 'link' }
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
export const mapApplicationData = async (rawData, editionId, columnMapping, importBatchId = null) => {
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
        // Create a unique ID based on email AND edition AND import batch (if provided)
        // This prevents overwrites on subsequent imports
        const idBase = importBatchId
            ? `${email}-${editionId}-${importBatchId}`
            : `${email}-${editionId}`;

        const id = await hashString(idBase);

        // Define required document keys
        const requiredDocs = [
            'learningAgreement',
            'motivation',
            'records',
            'irs',
            'presentation',
            'iban'
        ];

        // Check for missing documents
        const missingDocs = [];
        const documents = {
            iban: getValue('iban'),
            motivation: getValue('motivation'),
            records: getValue('records'),
            learningAgreement: getValue('learningAgreement'),
            irs: getValue('irs'),
            presentation: getValue('presentation'),
            citizenCard: getValue('citizenCard')
        };

        requiredDocs.forEach(key => {
            const docUrl = documents[key];
            // Check if the URL is missing or empty (ignoring potential "No file" type strings if relying purely on truthiness)
            if (!docUrl || docUrl.trim() === '') {
                // Map key to readable label
                const label = CSV_FIELD_CONFIG.find(f => f.key === key)?.label || key;
                missingDocs.push(label);
            }
        });

        let status = 'not_started';
        const comments = [];

        if (missingDocs.length > 0) {
            status = 'discarded';
            const missingList = missingDocs.join(', ');
            comments.push({
                text: `Application automatically discarded due to missing required documents: ${missingList}.`,
                timestamp: new Date().toISOString(),
                author: 'System',
                authorId: 'system'
            });
        }

        return {
            id: id,
            editionId: editionId,
            status: 'submitted', // Original mapping kept this 'submitted', but our review status is nested
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
                destinationUniversity: getValue('destinationUniversity'),
                semester: null,
                academicYear: getValue('applicationYear') // Often same as valid application year in this context
            },
            financialInfo: {
                iban: null,
                bankAccountOwner: null
            },
            documents: documents,
            review: {
                status: status,
                score: 0,
                comments: comments
            }
        };
    });

    const results = await Promise.all(mappedPromises);
    return results.filter(Boolean);
};
