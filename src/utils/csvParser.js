import Papa from 'papaparse';

export const parseCSV = (fileOrUrl) => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileOrUrl, {
            download: true,
            header: true,
            complete: (results) => {
                resolve(results.data);
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

export const mapApplicationData = async (rawData, editionId) => {
    // Validate editionId
    if (!editionId) {
        throw new Error("Edition ID is required for mapping application data");
    }

    const mappedPromises = rawData.map(async (row, index) => {
        // Skip empty rows
        if (!row['Nome'] && !row['E-mail']) return null;

        const email = row['E-mail'] ? row['E-mail'].trim().toLowerCase() : '';
        // Create a unique ID based on email AND edition to allow same person in multiple editions
        const id = await hashString(`${email}-${editionId}`);

        return {
            id: id,
            editionId: editionId,
            status: 'submitted', // Default status for new imports
            importedAt: new Date().toISOString(),
            personalInfo: {
                name: row['Nome'],
                email: row['E-mail'],
                birthDate: row['Data de Nascimento'],
                address: row['Morada Fiscal'],
                phoneNumber: null, // Not in CSV
                studentNumber: null, // Not in CSV
                contact: row['Desejas ser contactado para saber quando abre o nosso recrutamento?'],
                gdpr: row['O tratamento de dados é aceite?']
            },
            academicInfo: {
                university: row['Faculdade/ Universidade que frequentas'],
                course: row['Curso que frequentas'],
                currentYear: row['Ano em que te encontras'],
                // 'Ano' might be application year, let's store it
                applicationYear: row['Ano']
            },
            mobilityInfo: {
                destinationCity: row['Cidade e País de Destino'],
                destinationCountry: (row['País  '] || row['País'] || '').trim(),
                semester: null, // Not in CSV
                academicYear: row['Ano'] // Assuming 'Ano' refers to the mobility year
            },
            financialInfo: {
                iban: null, // Only file provided in CSV
                bankAccountOwner: null // Only file provided in CSV
            },
            documents: {
                // Map to internal keys expected by ReviewView/ImportView
                proofOfIban: row['Identificação do IBAN e do titular da conta para o qual pretende a transferência do valor da bolsa, caso lhe seja atribuída (ficheiro .pdf)'],
                motivationLetter: row['Carta de Motivação ( ficheiro .pdf)'],
                transcriptOfRecords: row['Comprovativo de aproveitamento académico (ficheiro .pdf)'],
                learningAgreement: row['Fotocópia do Learning Agreement assinado ou Carta de Aceitação assinada da instituição de destino (ficheiro .pdf)'],
                socialDisadvantageItem: row['Fotocópia da declaração do IRS correspondente ao ano civil anterior ao início do ano letivo anterior a que se refere a candidatura à bolsa (ficheiro .pdf)'],
                presentation: row['Apresentação Powerpoint/Canva a explicares o porquê de teres escolhido o Programa Erasmus+ e sobre como achas que a mobilidade internacional impacta a vida pessoal, académica e profissional dos jovens (ficheiro .pdf)'],
                // Standard keys that might be missing in this specific CSV format
                cv: null,
                proofOfEnrolment: null,
                idPassportItem: null
            },
            // Initialize empty review structure
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
