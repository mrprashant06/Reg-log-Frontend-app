import React, { useRef, useEffect } from 'react';

/**
 * 6-Digit Individual Numeric Input Boxes with auto-focus advancing,
 * backspace navigation, and paste handling.
 */
export default function OtpInput({ value = '', onChange, disabled = false, theme = 'violet' }) {
  const inputsRef = useRef([]);

  // Ensure digits array of length 6
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || '');

  useEffect(() => {
    // Auto focus first input if empty and enabled
    if (!disabled && inputsRef.current[0] && value.length === 0) {
      inputsRef.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e, index) => {
    const char = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto-advance if character entered
    if (char && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputsRef.current[index - 1]) {
        // Move back and clear previous
        inputsRef.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        e.preventDefault();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      if (inputsRef.current[focusIndex]) {
        inputsRef.current[focusIndex].focus();
      }
    }
  };

  return (
    <div className={`otp-boxes-grid theme-${theme}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`otp-box ${digit ? 'filled' : ''}`}
          aria-label={`Digit ${index + 1} of 6`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
