import React from 'react';
import { FileText, CreditCard, FileSpreadsheet, FileCheck, FileBarChart, Mic } from 'lucide-react';

const DocumentIcon = ({ type }) => {
    // All icons use ESN Dark Blue for simplicity and consistency
    const iconColor = "text-esn-dark-blue";

    switch (type) {
        case 'iban': return <CreditCard className={`w-6 h-6 ${iconColor}`} />;
        case 'irs': return <FileSpreadsheet className={`w-6 h-6 ${iconColor}`} />;
        case 'learningAgreement': return <FileCheck className={`w-6 h-6 ${iconColor}`} />;
        case 'motivation': return <FileText className={`w-6 h-6 ${iconColor}`} />;
        case 'records': return <FileBarChart className={`w-6 h-6 ${iconColor}`} />;
        case 'presentation': return <Mic className={`w-6 h-6 ${iconColor}`} />;
        default: return <FileText className={`w-6 h-6 ${iconColor}`} />;
    }
};

export default DocumentIcon;
