import React, { useState, useEffect } from "react";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
    getTransferRequests,
    createTransferRequest,
    updateTransferRequest,
    deleteTransferRequest
} from "../services/transferRequestService";
import { TransferRequestModal } from "../components/TransferRequestModal";

export const TransferRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);

    const columns = [
        { key: "student_name", label: "Student" },
        { key: "cohort_request", label: "Requested Cohort" },
        { key: "possible_transfer_date", label: "Possible Transfer Date" },
        { key: "created_at", label: "Date Created" },
    ];

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getTransferRequests();
            // Flatten data: ensure student name is accessible
            // Assuming backend returns student as object with name, or just ID. 
            // If ID, we might need to fetch students or backend should return name.
            // Based on service Service, it seems simpler to rely on what backend gives.
            // Let's assume backend returns "student" as ID and maybe we need to map or backend returns object.
            // For now, let's look at api-back-end.md.
            // It says "student": <student_service_uuid>.
            // Usually DRF Default returns ID. If so, we might need a serializer update or fetch student names.
            // BUT, for MVP, let's assume the list endpoint might be enhanced or we just show what we have.
            // Wait, looking at `Service` page, it processes `client_name`.
            // Let's assume for now we might get an ID. If so, we can't show name easily without fetching all students. 
            // However, typically the list view serializer would include depth or read-only fields.
            // Let's assume best case (name is there) or we will fix it later.
            // Actually, I'll add logic to try to read student.name if object, or just display ID if not.
            const processed = data.map(r => ({
                ...r,
                // Backend now returns student_name directly
                student_name: r.student_name || r.student?.toString() || "Unknown",
                // Ensure dates are formatted if needed, or rely on Table component's date handling
                created_at: r.created_at ? new Date(r.created_at).toLocaleDateString() : "-",
                possible_transfer_date: r.possible_transfer_date ? new Date(r.possible_transfer_date).toLocaleDateString() : "-"
            }));
            setRequests(processed);
        } catch (error) {
            console.error("Error fetching transfer requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingRequest(null);
        setIsModalOpen(true);
    };

    const handleEdit = (request) => {
        setEditingRequest(request);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (editingRequest) {
                await updateTransferRequest(editingRequest.id, formData);
                Swal.fire("Success", "Request updated successfully", "success");
            } else {
                await createTransferRequest(formData);
                Swal.fire("Success", "Request created successfully", "success");
            }
            fetchRequests();
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Operation failed", "error");
            throw error; // Let modal handle loading state if reusable
        }
    };

    const handleDelete = async (request) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteTransferRequest(request.id);
                fetchRequests();
                Swal.fire('Deleted!', 'Request has been deleted.', 'success');
            } catch (error) {
                console.error("Error deleting request", error);
                Swal.fire('Error!', 'There was an error deleting the request.', 'error');
            }
        }
    };

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex items-center justify-between mb-2 ml-2">
                <h1 className="text-2xl font-bold">Transfer Requests</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Request
                </Button>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                <Table
                    data={requests}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    searchable={true}
                />
            </div>

            <TransferRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                dataToEdit={editingRequest}
            />
        </div>
    );
};
