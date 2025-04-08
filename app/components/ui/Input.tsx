'use client';

import React from 'react';
import InfoIcon from './icons/InfoIcon';

const InfoTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="group relative inline-block ml-2">
    <InfoIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
    <div className="hidden group-hover:block absolute z-50 left-0 transform translate-y-2 w-[400px]">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
        {children}
      </div>
    </div>
  </div>
);

interface InputProps {
  label: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  pattern?: string;
  title?: string;
  min?: string | number;
  max?: string | number;
  info?: React.ReactNode;
}

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  className = '',
  placeholder,
  pattern,
  title,
  min,
  max,
  info,
}: InputProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center mb-2">
        <label className="block text-gray-700 text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {info && <InfoTooltip>{info}</InfoTooltip>}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        min={min}
        max={max}
        className={`
          w-full px-4 py-3 rounded-lg border
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          ${type === 'date' ? 'cursor-pointer' : ''}
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:p-1
          [&::-webkit-calendar-picker-indicator]:hover:opacity-60
          dark:text-gray-900
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input; 