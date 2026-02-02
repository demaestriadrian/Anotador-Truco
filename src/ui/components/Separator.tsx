import React from 'react';
import '@/ui/styles/separator.css';

interface SeparatorProps {
    orientation: 'horizontal' | 'vertical';
    className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ orientation, className = '' }) => {
    return (
        <div
            className={`separator separator-${orientation} ${className}`}
            id={`separator-${orientation === 'horizontal' ? 'h' : 'v'}`}
        >
            {/* Inner elements for flag styling if needed, but CSS background is usually enough */}
            {orientation === 'vertical' && <div className="flag-ribbon"></div>}
        </div>
    );
};

export default Separator;
