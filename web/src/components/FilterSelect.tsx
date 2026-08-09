import {useEffect, useId, useRef, useState} from "react";
import {Check, ChevronDown} from "lucide-react";

interface FilterSelectProps {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  totalLabel: string;
  value: string;
}

export function FilterSelect({
  label,
  onChange,
  options,
  totalLabel,
  value,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const selectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value === "Todas" ? totalLabel : value;

  return (
    <div className={isOpen ? "filter-select is-open" : "filter-select"} ref={containerRef}>
      <span className="filter-select-label" id={controlId}>{label}</span>
      <button
        aria-controls={controlId + "-options"}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="filter-select-trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{displayValue}</span>
        <ChevronDown size={17} />
      </button>
      {isOpen ? (
        <ul aria-labelledby={controlId} className="filter-select-options" id={controlId + "-options"} role="listbox">
          <li>
            <button
              aria-selected={value === "Todas"}
              className={value === "Todas" ? "is-selected" : ""}
              onClick={() => selectOption("Todas")}
              role="option"
              type="button"
            >
              <span>{totalLabel}</span>
              {value === "Todas" ? <Check size={16} /> : null}
            </button>
          </li>
          {options.map((option) => (
            <li key={option}>
              <button
                aria-selected={value === option}
                className={value === option ? "is-selected" : ""}
                onClick={() => selectOption(option)}
                role="option"
                type="button"
              >
                <span>{option}</span>
                {value === option ? <Check size={16} /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
