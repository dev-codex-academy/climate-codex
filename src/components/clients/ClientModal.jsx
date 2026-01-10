import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { createClient, updateClient, uploadClientImage } from "../../services/clientService";

// UI Components
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"; // Import Select components

export const ClientModal = ({ isOpen, onClose, onClientSaved, clientToEdit = null, attributes = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [name, setName] = useState("");
    const [dynamicData, setDynamicData] = useState({});

    // File upload state
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (clientToEdit) {
                // Static fields
                setName(clientToEdit.name || "");

                // Dynamic fields - attributes are usually stored in a JSON field 'attributes' or flat on the object?
                // Based on LeadModal pattern, it sends "attributes" object. 
                // However, Table displays them as flat keys (row[col.key]). 
                // This implies the backend serializer might flatten them or we need to handle it.
                // If the backend returns them flat, we just look for the key. 
                // If it returns an 'attributes' object, we look there.
                // Let's assume for now they might be on the root object or in 'attributes'.
                // LeadService: getLeads returns whatever backend sends. 
                // clientService: getClients returns whatever backend sends.
                // Safest bet: Check if clientToEdit[attr.name] exists, or clientToEdit.attributes?.[attr.name]

                const newDynamicData = {};
                attributes.forEach(attr => {
                    // Try to find the value in root or in attributes dict
                    const val = clientToEdit[attr.name] !== undefined ? clientToEdit[attr.name] : (clientToEdit.attributes?.[attr.name] || "");
                    newDynamicData[attr.name] = val;
                });
                setDynamicData(newDynamicData);

                // Images
                setImages(clientToEdit.list_of_images || []);

            } else {
                setName("");
                // Initialize dynamic data
                const newDynamicData = {};
                attributes.forEach(attr => {
                    newDynamicData[attr.name] = "";
                });
                setDynamicData(newDynamicData);
                setImages([]);
            }
        }
    }, [isOpen, clientToEdit, attributes]);

    const handleDynamicChange = (name, value) => {
        setDynamicData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !clientToEdit) return;
        setUploading(true);
        console.log("Uploading file:", selectedFile.name, "for client:", clientToEdit.id);
        try {
            const res = await uploadClientImage(clientToEdit.id, selectedFile);
            console.log("Upload response:", res);
            setImages(res.list_of_images || []); // Update list from response
            setSelectedFile(null);
            // Clear input
            const fileInput = document.getElementById("file-upload");
            if (fileInput) fileInput.value = "";
            onClientSaved(); // Trigger refresh on parent
        } catch (err) {
            console.error("Upload error details:", err);
            setError(`Failed to upload image. ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name,
                attributes: dynamicData
            };

            let savedClient;
            if (clientToEdit) {
                savedClient = await updateClient(clientToEdit.id, payload);
                // If we have a file selected, upload it now
                if (selectedFile) {
                    console.log("Uploading pending file for existing client...");
                    await uploadClientImage(clientToEdit.id, selectedFile);
                }
            } else {
                savedClient = await createClient(payload);
                // If we have a file selected, upload it now using the new ID
                if (selectedFile && savedClient && savedClient.id) {
                    console.log("Uploading pending file for new client...");
                    await uploadClientImage(savedClient.id, selectedFile);
                }
            }
            onClientSaved();
            onClose();
        } catch (err) {
            console.error("Error saving client", err);
            setError(`Failed to save client. ${err.message || ""}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={clientToEdit ? "Edit Client" : "New Client"}
            showFooter={false}
            widthClass="sm:w-[600px]"
        >
            <div className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Acme Corp"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Dynamic Attributes */}
                {attributes.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">Additional Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {attributes.map((attr) => (
                                <div key={attr.name} className="space-y-2">
                                    <Label htmlFor={attr.name}>{attr.label}</Label>
                                    {attr.type === 'list' ? (
                                        <Select
                                            onValueChange={(val) => handleDynamicChange(attr.name, val)}
                                            value={dynamicData[attr.name] || ""}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Select ${attr.label}`} />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                            value={dynamicData[attr.name] || ""}
                                            onChange={(e) => handleDynamicChange(attr.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* File Upload Section (Only in Edit Mode) */}
                {clientToEdit && (
                    <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">Files & Images</h4>

                        {/* Image Gallery */}
                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {images.map((imgUrl, idx) => (
                                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border">
                                        <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No images uploaded yet.</p>
                        )}

                        {/* Upload Input */}
                        <div className="flex gap-2 items-end">
                            <div className="w-full space-y-2">
                                <Label htmlFor="file-upload">Upload New Image</Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                variant="secondary"
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading || uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading ? "Saving..." : clientToEdit ? "Update Client" : "Create Client"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
