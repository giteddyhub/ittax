'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface DateInputProps {
  label: string;
  value: Date | string | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  error?: string;
  min?: string;
  max?: string;
  className?: string;
}

const DateInput = ({
  label,
  value,
  onChange,
  required = false,
  error,
  min,
  max,
  className = '',
}: DateInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format the date for display
  const formattedDate = value
    ? format(new Date(value), 'dd/MM/yyyy')
    : '';

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formattedDate}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer bg-white`}
          placeholder="Select date"
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
            <input
              type="date"
              value={value instanceof Date ? value.toISOString().split('T')[0] : value || ''}
              onChange={(e) => {
                onChange(e.target.value ? new Date(e.target.value) : null);
                setIsOpen(false);
              }}
              min={min}
              max={max}
              className="w-full p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DateInput; 