import React, { useState } from 'react';
import '@/ui/styles/scorekeeper.css'; // Reusing styles or creating new specific ones

interface TeamNameProps {
    teamId: 'A' | 'B';
    placeholder: string;
    initialName?: string;
    onNameChange?: (name: string) => void;
}

const TeamName: React.FC<TeamNameProps> = ({ teamId, placeholder, initialName = '', onNameChange }) => {
    const [name, setName] = useState(initialName);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (onNameChange) {
            onNameChange(newName);
        }
    };

    return (
        <div className={`team-name-container team-${teamId}`}>
            <input
                type="text"
                className="team-name-input"
                placeholder={placeholder}
                value={name}
                onChange={handleChange}
                maxLength={15} // Limit name length for aesthetics
            />
        </div>
    );
};

export default TeamName;
