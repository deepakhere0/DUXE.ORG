import React from 'react';

const Progress = ({ value = 0, max = 100, label }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {label && <div className="mb-1 text-sm text-gray-700">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Progress;
