import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string | [string, string])[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

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

  const selectedOption = parsedOptions.find((opt) => opt.value === value);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Position the dropdown right below the trigger button
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Update coords and handle click outside / scroll
  useEffect(() => {
    if (isOpen) {
      updateCoords();
      
      // Request another coordinate update on next frame to ensure correct initial layout
      const animFrameId = requestAnimationFrame(updateCoords);
      
      const handleScrollOrResize = (event: Event) => {
        // If scroll happened inside the portal itself, do not close or recalculate
        if (portalRef.current && portalRef.current.contains(event.target as Node)) {
          return;
        }
        updateCoords();
      };

      const handleClickOutside = (event: MouseEvent) => {
        const isClickInsideContainer = containerRef.current && containerRef.current.contains(event.target as Node);
        const isClickInsidePortal = portalRef.current && portalRef.current.contains(event.target as Node);
        if (!isClickInsideContainer && !isClickInsidePortal) {
          setIsOpen(false);
        }
      };

      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <style>{`
        .custom-select-trigger {
          border: 2px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-family: var(--font-family);
          font-size: 13.5px;
          transition: all 0.15s ease;
        }
        .custom-select-trigger:hover {
          border-color: var(--brand);
          opacity: 0.95;
        }
        .custom-select-trigger.open, .custom-select-trigger:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.15);
          outline: none;
        }
        .custom-select-option {
          color: var(--foreground);
          background: transparent;
          transition: all 0.15s ease;
        }
        .custom-select-option:hover {
          background: var(--sidebar-active-bg) !important;
          color: var(--sidebar-active-text) !important;
        }
        .custom-select-option.selected {
          background: var(--sidebar-active-bg) !important;
          color: var(--sidebar-active-text) !important;
          font-weight: 700;
        }
      `}</style>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`custom-select-trigger w-full flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer ${
          isOpen ? "open" : ""
        } ${className}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? "rotate-180 text-[var(--brand)]" : ""
          }`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={portalRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute rounded-xl shadow-lg p-1.5 space-y-0.5 custom-scrollbar overflow-y-auto"
              style={{
                zIndex: 9999,
                maxHeight: "240px",
                border: "2px solid var(--border)",
                background: "var(--card)",
                top: `${coords.top + 6}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
            >
              {parsedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left border-none cursor-pointer custom-select-option ${
                      isSelected ? "selected" : ""
                    }`}
                    style={{
                      fontFamily: "var(--font-family)",
                      fontSize: "13px",
                    }}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0 ml-1.5 text-[var(--sidebar-active-text)]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
