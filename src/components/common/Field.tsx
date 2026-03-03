import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  tooltip?: string;
  loading?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, error, disabled, tooltip, loading, ...props }) => (
  <div className="space-y-1.5">
    {/* Label + Info */}
    <div className="flex items-center gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {tooltip && (
        <div className="relative group">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-pointer" />
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-56
                            opacity-0 group-hover:opacity-100
                            transition bg-gray-900 text-white text-xs
                            rounded-md px-3 py-2 shadow-lg z-50 pointer-events-none"
          >
            {tooltip}
          </div>
        </div>
      )}
    </div>

    <div className="relative">
      {/* Input */}
      <input
        title={tooltip}
        {...props}
        disabled={disabled}
        className={`w-full h-11 px-3 rounded-lg border text-sm transition
        ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
        ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-slate-500/20 focus:border-slate-500'}
        focus:outline-none focus:ring-2`}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>

    {/* Disabled Helper */}
    {/* {disabled && tooltip && <p className="text-xs text-gray-500">{tooltip}</p>} */}

    {/* Error */}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default Field;
