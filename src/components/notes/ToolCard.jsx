import React from 'react';

const ToolCard = ({ title, icon: Icon, description, ctaLabel = 'Open', onClick }) => {
  return (
    <div className="card h-full flex flex-col">
      <div className="card-body flex-1">
        <div className="w-12 h-12 bg-accent-100 text-accent-700 rounded-xl flex items-center justify-center mb-4">
          {Icon ? <Icon className="w-6 h-6" /> : <span className="font-bold">AI</span>}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-4 pt-0">
        <button className="btn btn-primary btn-md w-full" onClick={onClick}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

export default ToolCard;
