import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showGenerate?: boolean;
  label?: string;
  required?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  showGenerate = false,
  label,
  required = false
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange(password);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}

      <div className="relative flex items-center">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
        />

        {/* 👁 Show / Hide Button */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-12 text-slate-500 hover:text-slate-700 transition"
        >
          {visible ? (
            // Eye Off
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7
                0-1.06.32-2.07.875-2.975M6.2 6.2A9.956 9.956 0 0112 5c5 0
                9 4 9 7 0 1.06-.32 2.07-.875 2.975M15 12a3 3 0 11-6 0
                3 3 0 016 0zm6 6L3 3"
              />
            </svg>
          ) : (
            // Eye
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0
                3 3 0 016 0zm6 0c0 3-4 7-9 7s-9-4-9-7
                4-7 9-7 9 4 9 7z"
              />
            </svg>
          )}
        </button>

        {/* 🔑 Auto Generate Button (Optional) */}
        {showGenerate && (
          <button
            type="button"
            onClick={generatePassword}
            className="absolute right-0 mr-2 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
          >
            Auto
          </button>
        )}
      </div>
    </div>
  );
}
