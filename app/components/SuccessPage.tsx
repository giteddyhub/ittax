interface SuccessPageProps {
  onReset: () => void;
}

const SuccessPage = ({ onReset }: SuccessPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Submission Successful</h2>
          <p className="mt-2 text-gray-600">
            Your property tax information has been successfully submitted.
          </p>
          <div className="mt-6 space-y-2">
            <button
              onClick={onReset}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Another Form
            </button>
            <button
              onClick={() => window.print()}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 