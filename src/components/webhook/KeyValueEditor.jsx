import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, MoreHorizontal, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const AttributeInput = ({ value, onChange, availableAttributes = [] }) => {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)

    // Sync input value with prop value when it changes externally
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleSelect = (currentValue) => {
        // Append the attribute to the existing value
        const variable = `{${currentValue}}`;
        const newValue = inputValue ? `${inputValue}${variable}` : variable;

        onChange(newValue);
        setInputValue(newValue);
        setOpen(false);
    }

    return (
        <div className="relative flex items-center w-full">
            <Input
                className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 h-9 flex-1 min-w-0"
                placeholder="Value"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        role="combobox"
                        aria-expanded={open}
                        className="h-6 w-6 mr-1 shrink-0 opacity-50 hover:opacity-100"
                        title="Insert Attribute"
                    >
                        <ChevronsUpDown className="h-3 w-3" />
                        <span className="sr-only">Insert Attribute</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="end">
                    <Command>
                        <CommandInput placeholder="Search attributes..." />
                        <CommandList>
                            <CommandEmpty>No attribute found.</CommandEmpty>
                            <CommandGroup heading="Attributes">
                                {availableAttributes.map((attr) => (
                                    <CommandItem
                                        key={attr}
                                        value={attr}
                                        onSelect={() => handleSelect(attr)}
                                    >
                                        {attr}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export const KeyValueEditor = ({ pairs, onChange, availableAttributes = [] }) => {
    // pairs should be array of { key: string, value: string, active: boolean }

    const handleAdd = () => {
        onChange([...pairs, { key: "", value: "", active: true }]);
    };

    const handleRemove = (index) => {
        onChange(pairs.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, newValue) => {
        const newPairs = [...pairs];
        newPairs[index] = { ...newPairs[index], [field]: newValue };
        onChange(newPairs);
    };

    return (
        <div className="border rounded-md w-full overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_40px] gap-0 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                <div className="px-3 py-2 border-r">Key</div>
                <div className="px-3 py-2 border-r">Value</div>
                <div className="px-3 py-2"></div>
            </div>

            <div className="divide-y max-h-[300px] overflow-y-auto">
                {pairs.map((pair, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-0 group">
                        <div className="relative border-r">
                            <Input
                                className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 h-9"
                                placeholder="Key"
                                value={pair.key}
                                onChange={(e) => handleChange(index, 'key', e.target.value)}
                            />
                        </div>
                        <div className="relative border-r flex items-center min-w-0">
                            <AttributeInput
                                value={pair.value}
                                onChange={(val) => handleChange(index, 'value', val)}
                                availableAttributes={availableAttributes}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="ghost" className="w-full rounded-none border-t text-xs text-muted-foreground hover:text-foreground h-8" onClick={handleAdd}>
                <Plus className="mr-2 h-3 w-3" /> Add Parameter
            </Button>
        </div>
    );
};
