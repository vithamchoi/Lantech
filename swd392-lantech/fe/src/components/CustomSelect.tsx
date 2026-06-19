import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: (Option | string | [string, string])[];
  className?: string;
}

export default function CustomSelect({ value, onChange, options, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options into { value, label } format
  const parsedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    } else if (Array.isArray(opt)) {
      return { value: opt[0], label: opt[1] };
    } else {
      return opt;
    }
  });

  const selectedOption = parsedOptions.find((opt) => opt.value === value) || parsedOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200 outline-none"
        style={{
          borderColor: isOpen ? "var(--brand)" : "var(--border)",
          background: "var(--background)",
          color: "var(--foreground)",
          fontSize: "13.5px",
          fontFamily: "var(--font-family)",
          boxShadow: isOpen ? "0 0 0 3px rgba(88, 204, 2, 0.15)" : "none",
        }}
      >
        <span className="truncate font-medium">{selectedOption?.label}</span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand" : ""
          }`}
        />
      </div>

      {/* Options Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-border shadow-xl max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5"
            style={{
              background: "var(--card)",
            }}
          >
            {parsedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-brand/10 text-brand-dark dark:text-brand"
                      : "text-foreground hover:bg-muted"
                  }`}
                  style={{
                    fontFamily: "var(--font-family)",
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-brand flex-shrink-0" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
