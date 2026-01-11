import React, { useEffect, useState } from "react";
import { CohortList } from "../components/Cohorts/CohortList";
import { CohortModal } from "../components/Cohorts/CohortModal";
import { getCohorts, deleteCohort } from "../services/cohortService";
import { getInstructors } from "../services/userService";

export const Cohort = () => {
    const [cohorts, setCohorts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cohortData, instructorData] = await Promise.all([
                getCohorts(),
                getInstructors()
            ]);
            // API usually returns { results: [], count: ... } or just [] depending on implementation
            // Based on leadService, it returns res.json(). 
            // Let's assume standard DRF pagination or list.
            // If it's paginated, it might be data.results.

            setCohorts(cohortData.results || cohortData);
            setInstructors(instructorData.results || instructorData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (cohort) => {
        setSelectedCohort(cohort);
        setIsModalOpen(true);
    };

    const handleDelete = async (cohort) => {
        if (window.confirm(`Are you sure you want to delete ${cohort.name_cohort}?`)) {
            try {
                await deleteCohort(cohort.id);
                fetchData();
            } catch (error) {
                console.error("Error deleting cohort", error);
            }
        }
    };

    const handleAdd = () => {
        setSelectedCohort(null);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        fetchData();
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                    Cohort Management
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage cohorts and assign instructors.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <CohortList
                        data={cohorts}
                        instructors={instructors}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={handleAdd}
                    />
                )}
            </div>

            <CohortModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                cohortToEdit={selectedCohort}
                instructors={instructors}
            />
        </div>
    );
};
