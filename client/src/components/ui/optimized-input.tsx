import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (value: string | number) => void;
  debounceMs?: number;
  type?: "text" | "number" | "email" | "password";
}

export const OptimizedInput = React.memo(({ 
  value, 
  onValueChange, 
  debounceMs = 300,
  type = "text",
  ...props 
}: OptimizedInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback((newValue: string | number) => {
    onValueChange(newValue);
  }, debounceMs);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) || 0 : e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <Input
      {...props}
      type={type}
      value={localValue}
      onChange={handleChange}
    />
  );
});