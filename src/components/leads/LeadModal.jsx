import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { getLeadAttributes, createLead } from "../../services/leadService";

// UI Components
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const LeadModal = ({ isOpen, onClose, onLeadCreated, responsibleId, pipelineId }) => {
    const [attributes, setAttributes] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Standard static fields for a Lead
    // Assuming backend needs 'name' and 'responsible' at minimum alongside attributes
    // Adjust based on actual Model if different.
    const [name, setName] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchAttributes();
            setName("");
            setFormData({});
            setError(null);
        }
    }, [isOpen]);

    const fetchAttributes = async () => {
        try {
            const data = await getLeadAttributes();
            setAttributes(data);
            // Initialize default values
            const initialData = {};
            data.forEach(attr => {
                initialData[attr.name] = "";
            });
            setFormData(initialData);
        } catch (err) {
            console.error("Error fetching attributes", err);
            setError("Failed to load lead attributes.");
        }
    };

    const handleAttributeChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name,
                responsible: responsibleId, // Passed from parent or context
                pipeline: pipelineId,
                attributes: formData
            };

            await createLead(payload);
            onLeadCreated();
            onClose();
        } catch (err) {
            console.error("Error creating lead", err);
            setError("Failed to create lead. Please check the fields.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Opportunity"
            showFooter={false}
            widthClass="sm:w-[600px]"
        >
            <div className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                {/* Static Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="lead-name">Opportunity Name</Label>
                    <Input
                        id="lead-name"
                        placeholder="e.g. Acme Corp Deal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Dynamic Attributes */}
                {attributes.map((attr) => (
                    <div key={attr.name} className="space-y-2">
                        <Label htmlFor={attr.name}>{attr.label}</Label>

                        {attr.type === 'list' ? (
                            <Select
                                onValueChange={(val) => handleAttributeChange(attr.name, val)}
                                value={formData[attr.name]}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${attr.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Assuming attr.options is where the list items are. 
                                        If the API returns a different structure for list options, this needs adjustment. 
                                        Commonly it might be in 'options' or 'choices'. 
                                        For now assuming 'options' array. 
                                    */}
                                    {attr.options?.map((opt) => (
                                        <SelectItem key={opt.value || opt} value={opt.value || opt}>
                                            {opt.label || opt}
                                        </SelectItem>
                                    )) || <SelectItem value="no-options">No options available</SelectItem>}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id={attr.name}
                                type={attr.type === 'number' ? 'number' : 'text'}
                                placeholder={attr.label}
                                value={formData[attr.name] || ""}
                                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-end pt-4 gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Save Opportunity"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
