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

export const mapApplicationData = (rawData) => {
    return rawData.map((row, index) => {
        // Skip empty rows
        if (!row['Nome'] && !row['E-mail']) return null;

        return {
            id: index + 1, // Simple ID based on row index
            timestamp: row['Timestamp'],
            email: row['E-mail'],
            name: row['Nome'],
            birthDate: row['Data de Nascimento'],
            applicationYear: row['Ano'],
            university: row['Faculdade/ Universidade que frequentas'],
            course: row['Curso que frequentas'],
            year: row['Ano em que te encontras'],
            address: row['Morada Fiscal'],
            destinationCity: row['Cidade e País de Destino'],
            destinationCountry: row['País  '] || row['País'], // Handle potential variations
            documents: {
                iban: row['Identificação do IBAN e do titular da conta para o qual pretende a transferência do valor da bolsa, caso lhe seja atribuída (ficheiro .pdf)'],
                motivation: row['Carta de Motivação ( ficheiro .pdf)'],
                records: row['Comprovativo de aproveitamento académico (ficheiro .pdf)'],
                learningAgreement: row['Fotocópia do Learning Agreement assinado ou Carta de Aceitação assinada da instituição de destino (ficheiro .pdf)'],
                irs: row['Fotocópia da declaração do IRS correspondente ao ano civil anterior ao início do ano letivo anterior a que se refere a candidatura à bolsa (ficheiro .pdf)'],
                presentation: row['Apresentação Powerpoint/Canva a explicares o porquê de teres escolhido o Programa Erasmus+ e sobre como achas que a mobilidade internacional impacta a vida pessoal, académica e profissional dos jovens (ficheiro .pdf)'],
            },
            gdpr: row['O tratamento de dados é aceite?'],
            contact: row['Desejas ser contactado para saber quando abre o nosso recrutamento?'],
        };
    }).filter(Boolean);
};
