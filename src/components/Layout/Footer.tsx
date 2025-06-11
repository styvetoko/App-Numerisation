import React from 'react';

const Footer: React.FC = () => (
    <footer className="w-full bg-gray-100 border-t border-gray-200 py-4 mt-8 text-center text-sm text-gray-500">
        <span>&copy; {new Date().getFullYear()} DocFlow &mdash; INTERACT.</span>
    </footer>
);

export default Footer;
