'use client';

import Button from '../ui/Button';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Property Tax Intake Form
        </h1>
        <p className="text-lg text-gray-600">
          Complete your property tax information in a few simple steps.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          What you'll need:
        </h2>
        <ul className="space-y-4 mb-8">
          {[
            'Personal information for all property owners',
            'Property details and documentation',
            'Purchase or sale information from 2024',
            'Tax-related documents and receipts'
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="text-purple-600 mt-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-gray-600">{item}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onNext}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Get Started
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm">
        Need help? Contact our support team at support@italiantaxes.com
      </p>
    </div>
  );
};

export default WelcomeStep; 