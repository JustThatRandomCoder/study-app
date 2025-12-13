import React from 'react';
import packageJson from '../../package.json';
import './VersionBadge.css';

const VersionBadge = () => {
    return (
        <div className="version-badge">
            v{packageJson.version}
        </div>
    );
};

export default VersionBadge;
