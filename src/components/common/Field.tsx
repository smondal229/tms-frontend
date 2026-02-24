interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field: React.FC<FieldProps> = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className={`w-full h-11 px-3 rounded-lg border bg-white text-sm
      focus:outline-none focus:ring-2 focus:ring-slate-500/20
      focus:border-slate-500 transition
      ${error ? 'border-red-400' : 'border-gray-200'}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default Field;
