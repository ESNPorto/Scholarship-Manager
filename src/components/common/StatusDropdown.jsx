import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

const StatusDropdown = ({ status, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { value: 'not_started', label: 'Not Started', className: 'bg-gray-100 text-gray-500 border-gray-200', indicatorColor: '#9ca3af' },
        { value: 'in_progress', label: 'In Progress', className: 'bg-esn-orange text-white border-esn-orange', indicatorColor: 'bg-esn-orange' },
        { value: 'reviewed', label: 'Reviewed', className: 'bg-esn-green text-white border-esn-green', indicatorColor: 'bg-esn-green' },
        { value: 'discarded', label: 'Discarded', className: 'bg-red-500 text-white border-red-500', indicatorColor: 'bg-red-500' }
    ];

    const currentOption = options.find(o => o.value === status) || options[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-esn-dark-blue whitespace-nowrap min-w-[160px] ${currentOption.className}`}
            >
                {currentOption.label}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onStatusChange(option.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 group"
                        >
                            <div
                                className={`w-2 h-2 rounded-full transition-transform group-hover:scale-110 ${option.value === 'not_started' ? 'bg-gray-400' : option.indicatorColor}`}
                            />
                            <span className="text-gray-700">{option.label}</span>
                            {status === option.value && <CheckCircle2 className="w-4 h-4 ml-auto text-esn-dark-blue" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusDropdown;
