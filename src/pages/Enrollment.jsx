import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnrollmentList } from "@/components/Enrollments/EnrollmentList";
import { EnrollmentModal } from "@/components/Enrollments/EnrollmentModal";
import { getEnrollments, deleteEnrollment } from "@/services/enrollmentService";
import { getCohorts } from "@/services/cohortService";
import { getInstructors, getTAs } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";

export const Enrollment = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [tas, setTas] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

    const fetchData = async () => {
        try {
            const [enrollmentsData, cohortsData, instructorsData, tasData] = await Promise.all([
                getEnrollments(),
                getCohorts(),
                getInstructors(),
                getTAs()
            ]);
            setEnrollments(enrollmentsData);
            setCohorts(cohortsData);
            setInstructors(instructorsData);
            setTas(tasData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const navigate = useNavigate();

    const handleCreate = () => {
        setEditingEnrollment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (enrollment) => {
        setEditingEnrollment(enrollment);
        setIsModalOpen(true);
    };

    const handleView = (id) => {
        navigate(`/enrollment/${id}`);
    };

    const handleDeleteClick = (id) => {
        setEnrollmentToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!enrollmentToDelete) return;
        try {
            await deleteEnrollment(enrollmentToDelete);
            fetchData();
            setIsDeleteDialogOpen(false);
            setEnrollmentToDelete(null);
        } catch (error) {
            console.error("Error deleting enrollment:", error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Enrollments</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Enrollment
                </Button>
            </div>

            <EnrollmentList
                enrollments={enrollments}
                cohorts={cohorts}
                instructors={instructors}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onView={handleView}
            />

            <EnrollmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                enrollmentToEdit={editingEnrollment}
                cohorts={cohorts}
                instructors={instructors}
                tas={tas}
            />

            <Modal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Enrollment"
                showFooter={true}
                onConfirm={confirmDelete}
                confirmText="Delete"
                cancelText="Cancel"
                widthClass="sm:w-[400px]"
            >
                <p>Are you sure you want to delete this enrollment? This action cannot be undone.</p>
            </Modal>

        </div>
    );
};
