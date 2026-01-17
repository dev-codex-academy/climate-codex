import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select option...",
    disabled = false
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Find selected label
    const selectedOption = options.find((opt) => String(opt.id ?? opt.value) === String(value));
    const label = selectedOption ? selectedOption.value : null;

    // Filter options
    const filteredOptions = options.filter((opt) =>
        String(opt.value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (val) => {
        onChange(val);
        setOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-card/80 h-11 px-3 text-left font-normal"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
            >
                <span className="truncate">
                    {label || <span className="text-muted-foreground">{placeholder}</span>}
                </span>
                <div className="flex items-center gap-1 opacity-50 shrink-0">
                    {label && !disabled && (
                        <div
                            onClick={handleClear}
                            className="hover:bg-muted rounded-full p-0.5 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </div>
                    )}
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </Button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground shadow-md rounded-md border border-border animate-in fade-in-0 zoom-in-95">
                    <div className="p-1">
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 mb-1 focus-visible:ring-1"
                            autoFocus
                        />
                        <div className="max-h-60 overflow-y-auto overflow-x-hidden py-1">
                            {filteredOptions.length === 0 ? (
                                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                                    No results found.
                                </div>
                            ) : (
                                filteredOptions.map((opt) => {
                                    const isSelected = String(opt.id ?? opt.value) === String(value);
                                    return (
                                        <div
                                            key={String(opt.id ?? opt.value)}
                                            className={`
                                                relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none 
                                                hover:bg-accent hover:text-accent-foreground
                                                ${isSelected ? "bg-accent text-accent-foreground" : ""}
                                            `}
                                            onClick={() => handleSelect(String(opt.id ?? opt.value))}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                                            />
                                            <span className="truncate">{opt.value}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
