import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-0.5 text-gray-300 hover:text-gray-600 transition-colors"
      title="Copy"
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <ClipboardIcon className="w-3.5 h-3.5 text-gray-600" />
      )}
    </button>
  );
};

export default CopyButton;
