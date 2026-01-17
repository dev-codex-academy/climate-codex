import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Form } from "./Form";
import { getServices } from "../services/serviceService";

export const TransferRequestModal = ({
    isOpen,
    onClose,
    onSave,
    dataToEdit = null,
}) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadStudents();
        }
    }, [isOpen]);

    const loadStudents = async () => {
        try {
            // Fetch all students (services) to populate selector
            // Might need pagination handling if many students, but assuming small enough list or filtered search in future
            const data = await getServices();
            // Map to selector format { value: name, id: id }
            const mapped = data.map(s => ({ value: s.name, id: s.id }));
            setStudents(mapped);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        {
            name: "student",
            label: "Student",
            type: "searchable-selector",
            options: students,
            required: true,
            placeholder: "Select a student",
            disabled: !!dataToEdit, // Usually can't change the student on edit, but depends on requirements. Keeping safe.
        },
        {
            name: "cohort_request",
            label: "Requested Cohort",
            type: "text",
            required: true,
            placeholder: "e.g., Winter 2026",
            hint: "Enter the name of the cohort the student wants to transfer to."
        },
        {
            name: "possible_transfer_date",
            label: "Possible Transfer Date",
            type: "date",
            required: false,
            placeholder: "Select date",
        }
    ];

    const initialValues = dataToEdit ? {
        student: dataToEdit.student?.id || dataToEdit.student, // Handle if object or ID
        cohort_request: dataToEdit.cohort_request,
        possible_transfer_date: dataToEdit.possible_transfer_date
    } : {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={dataToEdit ? "Edit Transfer Request" : "New Transfer Request"}
        >
            <Form
                fields={fields}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                submitting={loading}
                submitText="Save Request"
            />
        </Modal>
    );
};
