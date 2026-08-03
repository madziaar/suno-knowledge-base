import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  successDuration?: number; // optional
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  className = "",
  successDuration = 2000,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } else {
        await navigator.clipboard.writeText(text);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);

    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [text, successDuration]);

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={`
        flex items-center gap-2 text-[10px] font-medium tracking-wide transition-all duration-200
        ${
          copied
            ? "text-success"
            : "text-muted hover:text-primary"
        }
        ${className}
      `}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
};