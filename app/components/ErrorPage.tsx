interface ErrorPageProps {
  error: Error | string;
  onRetry?: () => void;
  onReset?: () => void;
}

const ErrorPage = ({ error, onRetry, onReset }: ErrorPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Submission Failed</h2>
          <p className="mt-2 text-gray-600">
            {typeof error === 'string' ? error : error.message}
          </p>
          <div className="mt-6 space-y-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 