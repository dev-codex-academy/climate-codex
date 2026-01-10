import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export const AttributeForm = ({ entity, onSubmit, onCancel, isLoading }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const selectedType = watch("type");

    const handleFormSubmit = (data) => {
        let payload = {
            ...data,
            is_required: data.is_required === true
        };

        if (data.type === 'list' && typeof data.list_values === 'string') {
            // Convert comma separated string to array, trimming whitespace
            payload.list_values = data.list_values.split(',').map(s => s.trim()).filter(s => s);
        } else {
            payload.list_values = [];
        }

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Attribute for {entity}</h3>
                <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Name (Key)</label>
                <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                    placeholder="e.g. industry_sector"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                <p className="text-xs text-muted-foreground mt-1">Internal identifier (unique, no spaces).</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Label (Display Name)</label>
                <input
                    {...register("label", { required: "Label is required" })}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                    placeholder="e.g. Industry Sector"
                />
                {errors.label && <span className="text-red-500 text-xs">{errors.label.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                    {...register("type", { required: "Type is required" })}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground"
                >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="list">Select List</option>
                    <option value="textarea">Text Area</option>
                    <option value="file">File</option>
                </select>
            </div>

            {selectedType === 'list' && (
                <div>
                    <label className="block text-sm font-medium mb-1">List Options (Comma separated)</label>
                    <textarea
                        {...register("list_values", { required: "List options are required for list type" })}
                        className="w-full p-2 rounded-md border border-border bg-background text-foreground h-24"
                        placeholder="Option 1, Option 2, Option 3"
                    />
                    {errors.list_values && <span className="text-red-500 text-xs">{errors.list_values.message}</span>}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    {...register("description")}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground h-20"
                    placeholder="Describe what this attribute is for..."
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_required"
                    {...register("is_required")}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_required" className="text-sm font-medium">Required Field</label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Attribute'}
                </Button>
            </div>
        </form>
    );
};
