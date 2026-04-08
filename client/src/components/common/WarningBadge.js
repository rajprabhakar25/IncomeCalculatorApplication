import React from 'react';

/**
 * Displays a warning or info badge/box.
 * type: 'danger' (red) | 'warning' (yellow)
 */
function WarningBadge({ message, type = 'danger' }) {
  if (!message) return null;
  return (
    <div className={`warning-box ${type === 'warning' ? 'warning-yellow' : ''}`}>
      <span>⚠</span>
      <span>{message}</span>
    </div>
  );
}

export default WarningBadge;
