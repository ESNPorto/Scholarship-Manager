import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    className = '',
    buttonClassName = '',
    label = '',
    icon: Icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Normalize options to { value, label } format
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null && 'value' in opt) {
            return opt;
        }
        return { value: opt, label: opt };
    });

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 hover:bg-gray-50 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 bg-white w-full justify-between ${buttonClassName}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                    {label && <span className="text-gray-500 font-medium">{label}</span>}
                    <span className={`text-sm ${selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {normalizedOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between group transition-colors ${value === option.value
                                ? 'bg-esn-dark-blue/5 text-esn-dark-blue font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="truncate">{option.label}</span>
                            {value === option.value && (
                                <Check className="w-4 h-4 text-esn-dark-blue flex-shrink-0 ml-2" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;
