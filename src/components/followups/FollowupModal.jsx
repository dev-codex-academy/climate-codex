import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { useAuth } from "../../context/AuthContext";
import { createFollowup, updateFollowup } from "../../services/followupService";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const FollowupModal = ({ isOpen, onClose, onFollowupSaved, followupToEdit = null, serviceId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Model fields: type, follow_up_date, comment
    const [type, setType] = useState("");
    const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
    const [comment, setComment] = useState("");

    const FOLLOW_UP_TYPES = [
        { value: 'email', label: 'Email' },
        { value: 'psychological_orientation', label: 'Psychological Orientation' },
        { value: 'ta_mentorship', label: 'TA Mentorship' },
        { value: 'phone_call', label: 'Phone Call' },
    ];

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (followupToEdit) {
                setType(followupToEdit.type || "");
                // Handle extraction of YYYY-MM-DD from DateTime string if necessary
                const dateVal = followupToEdit.follow_up_date ? followupToEdit.follow_up_date.split('T')[0] : new Date().toISOString().split('T')[0];
                setFollowUpDate(dateVal);
                setComment(followupToEdit.comment || "");
            } else {
                setType("");
                setFollowUpDate(new Date().toISOString().split('T')[0]);
                setComment("");
            }
        }
    }, [isOpen, followupToEdit]);

    const handleSubmit = async () => {
        if (!type || !followUpDate || !comment.trim()) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                type,
                follow_up_date: followUpDate,
                comment,
                service: serviceId,
                user: user.id
            };

            if (followupToEdit) {
                await updateFollowup(serviceId, followupToEdit.id, payload);
            } else {
                await createFollowup(serviceId, payload);
            }
            onFollowupSaved();
            onClose();
        } catch (err) {
            console.error("Error saving follow-up", err);
            setError(`Failed to save follow-up. ${err.message || ""}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={followupToEdit ? "Edit Follow Up" : "New Follow Up"}
            showFooter={false}
        >
            <div className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {FOLLOW_UP_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                        id="comment"
                        placeholder="Details about the follow-up..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : followupToEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
