import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { getServices, deleteService, getServiceAttributes } from "../services/serviceService";
import { ServiceModal } from "../components/services/ServiceModal";
import Swal from "sweetalert2";

export const Service = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const navigate = useNavigate();

    const staticColumns = [
        { key: "name", label: "Name" },
        { key: "client_name", label: "Client" }, // Flattening logic needed if not provided
    ];

    const [columns, setColumns] = useState(staticColumns);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesData, attributesData] = await Promise.all([
                getServices(),
                getServiceAttributes()
            ]);

            // Flatten data for table
            const processedServices = servicesData.map(service => ({
                ...service,
                client_name: service.client ? (service.client.name || service.client) : "",
                // Flatten dynamic attributes
                ...(service.attributes || {})
            }));

            setServices(processedServices);
            setAttributes(attributesData);

            // Dynamic columns from attributes
            const dynamicColumns = attributesData.map(attr => ({
                key: attr.name,
                label: attr.label
            }));

            setColumns([...staticColumns, ...dynamicColumns]);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service) => {
        setServiceToEdit(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (service) => {
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
                await deleteService(service.id);
                fetchData();
                Swal.fire(
                    'Deleted!',
                    'Student has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting student", error);
                Swal.fire(
                    'Error!',
                    'There was an error deleting the student.',
                    'error'
                );
            }
        }
    };

    const handleServiceSaved = () => {
        fetchData();
    };

    const openNewServiceModal = () => {
        setServiceToEdit(null);
        setIsModalOpen(true);
    };

    const handleViewFollowup = (service) => {
        navigate(`/followup?service_id=${service.id}&student_name=${encodeURIComponent(service.name)}`);
    };

    return (
        <div className="h-full flex flex-col p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Students (Services)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your students and view their details.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={openNewServiceModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-4 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <Table
                    data={services}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    verSeguimiento={handleViewFollowup}
                    searchable={true}
                />
            </div>

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onServiceSaved={handleServiceSaved}
                serviceToEdit={serviceToEdit}
                attributes={attributes}
            />
        </div>
    );
};
