import React from 'react';
import { Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            icon: Facebook,
            href: 'https://www.facebook.com/ErasmusStudentNetworkPorto',
            label: 'Facebook'
        },
        {
            icon: Linkedin,
            href: 'https://www.linkedin.com/company/esnporto/',
            label: 'LinkedIn'
        },
        {
            icon: Instagram,
            href: 'https://www.instagram.com/esnporto/',
            label: 'Instagram'
        },
        {
            icon: Youtube,
            href: 'https://www.youtube.com/@ESNPorto2012',
            label: 'YouTube'
        }
    ];

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-500 text-sm font-medium">
                        ESN Porto &copy; {currentYear}
                    </div>

                    <div className="flex items-center gap-6">
                        {socialLinks.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-esn-dark-blue transition-colors duration-200"
                                aria-label={label}
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
