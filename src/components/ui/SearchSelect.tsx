import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

const SearchSelect = ({
  label,
  value,
  options,
  onChange,
  error,
  disabled,
  tooltip,
  placeholder = 'Search...'
}: any) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (debouncedQuery.length < 3) return [];

    return options
      .filter((opt: string) => opt.toLowerCase().includes(debouncedQuery.toLowerCase()))
      .slice(0, 30);
  }, [debouncedQuery, options]);

  const onFocus = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <div
      className={`space-y-1.5 relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      ref={wrapperRef}
    >
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

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={onFocus}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        disabled={disabled}
        className={`w-full h-11 px-3 rounded-lg border bg-white text-sm
        focus:outline-none focus:ring-2 focus:ring-slate-500/20
        focus:border-slate-500 transition
        ${error ? 'border-red-400' : 'border-gray-200'}`}
      />

      {!disabled && open && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-auto">
          {filteredOptions.map((city: string, index: number) => (
            <div
              key={`${city}.${index}`}
              onClick={() => {
                setQuery(city);
                onChange(city);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {city}
            </div>
          ))}
        </div>
      )}

      {!disabled && open && debouncedQuery.length < 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm text-gray-500">
          Type at least 3 characters...
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SearchSelect;
