import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { getFollowups, deleteFollowup } from "../services/followupService";
import { FollowupModal } from "../components/followups/FollowupModal";
import Swal from "sweetalert2";

export const Followup = () => {
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get("service_id");
    const studentName = searchParams.get("student_name") || "Student";
    const navigate = useNavigate();

    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [followupToEdit, setFollowupToEdit] = useState(null);

    const columns = [
        { key: "follow_up_date", label: "Date" },
        { key: "type", label: "Type" },
        { key: "comment", label: "Comment" },
    ];

    useEffect(() => {
        if (serviceId) {
            fetchData();
        } else {
            setLoading(false); // No ID, technically empty or error state
        }
    }, [serviceId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getFollowups(serviceId);
            const formattedData = data.map(item => ({
                ...item,
                follow_up_date: item.follow_up_date ? item.follow_up_date.split('T')[0] : ""
            }));
            setFollowups(formattedData);
        } catch (error) {
            console.error("Error fetching followups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (followup) => {
        setFollowupToEdit(followup);
        setIsModalOpen(true);
    };

    const handleDelete = async (followup) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteFollowup(serviceId, followup.id);
                fetchData();
                Swal.fire(
                    'Deleted!',
                    'Follow-up has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting follow-up", error);
                Swal.fire(
                    'Error!',
                    'There was an error deleting the follow-up.',
                    'error'
                );
            }
        }
    };

    const handleFollowupSaved = () => {
        fetchData();
    };

    const openNewFollowupModal = () => {
        setFollowupToEdit(null);
        setIsModalOpen(true);
    };

    if (!serviceId) {
        return (
            <div className="p-4">
                <p>No Student Selected. Please navigate from the Student list.</p>
                <Button onClick={() => navigate("/service")}>Go to Students</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate("/service")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Follow Ups
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        History for: <span className="font-semibold text-foreground">{studentName}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={openNewFollowupModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Follow Up
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-4 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <Table
                    data={followups}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    searchable={true}
                />
            </div>

            <FollowupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFollowupSaved={handleFollowupSaved}
                followupToEdit={followupToEdit}
                serviceId={serviceId}
            />
        </div>
    );
};
