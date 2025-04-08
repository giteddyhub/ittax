'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle = ({ checked, onChange, label, disabled = false }: ToggleProps) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-11 h-6 rounded-full transition-colors duration-300 ${
            checked ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        />
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
            checked ? 'transform translate-x-5' : 'transform translate-x-0'
          }`}
        />
      </div>
      {label && (
        <span className="ml-3 text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
};

export default Toggle; 