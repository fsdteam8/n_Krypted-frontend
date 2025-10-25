"use client";

import { useRef, useCallback } from "react";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string; // optional, not required
  inputClassName?: string; // optional, not required
  numericOnly?: boolean;
}

export function CustomOtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  numericOnly = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const regex = numericOnly ? /^[0-9]*$/ : /^[a-zA-Z0-9]*$/;

      if (!regex.test(newValue)) return;

      const newOtp = [...value];
      newOtp[index] = newValue.slice(-1).toLowerCase();
      onChange(newOtp);

      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length, numericOnly]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [value, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;

      const pasted = e.clipboardData
        .getData("text/plain")
        .trim()
        .toLowerCase()
        .replace(numericOnly ? /[^0-9]/g : /[^a-zA-Z0-9]/g, "");

      if (pasted.length === length) {
        const newOtp = pasted.split("").slice(0, length);
        onChange(newOtp);
        inputRefs.current[length - 1]?.focus();
      } else if (pasted.length > 0) {
        const newOtp = [...value];
        for (let i = 0; i < Math.min(pasted.length, length); i++) {
          newOtp[i] = pasted[i];
        }
        onChange(newOtp);
      }
    },
    [disabled, length, onChange, numericOnly, value]
  );

  // Default dark styles for each input box
  const baseInputClasses =
    "h-12 w-12 rounded-md border text-center text-xl " +
    "bg-black text-white caret-white " +
    "border-gray-600 placeholder:text-gray-400 " +
    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "transition-colors";

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type={numericOnly ? "tel" : "text"}
          inputMode={numericOnly ? "numeric" : "text"}
          // Helps mobile keyboards; pattern is advisory (doesn't block input)
          pattern={numericOnly ? "[0-9]*" : "[A-Za-z0-9]*"}
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`${baseInputClasses} ${inputClassName}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Verification code digit ${index + 1} of ${length}`}
          data-testid={`otp-input-${index}`}
        />
      ))}
    </div>
  );
}
