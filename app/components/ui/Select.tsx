'use client';

import { DetailedHTMLProps, SelectHTMLAttributes } from 'react';

interface SelectProps extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = ({ label, error, className = '', ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 rounded-lg border ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
        } focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select; 