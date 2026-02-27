import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus, Search } from "lucide-react";
import { getServices, deleteService, getServiceAttributes } from "../services/serviceService";
import { getClients } from "../services/clientService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Swal from "sweetalert2";

export const Service = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const navigate = useNavigate();

    const staticColumns = [
        { key: "name", label: "Name" },
    ];

    const [columns, setColumns] = useState(staticColumns);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [attributesData, clientsData] = await Promise.all([
                getServiceAttributes(),
                getClients()
            ]);

            setAttributes(attributesData);
            setClients(clientsData);

            // Dynamic columns from attributes
            const dynamicColumns = attributesData.map(attr => ({
                key: attr.name,
                label: attr.label
            }));

            setColumns([...staticColumns, ...dynamicColumns]);
        } catch (error) {
            console.error("Error fetching initial data", error);
        }
    };

    const handleSearch = async () => {
        if (!selectedClient) {
            Swal.fire('Info', 'Please select a client to search.', 'info');
            return;
        }

        setLoading(true);
        try {
            const servicesData = await getServices({ client: selectedClient });

            // Flatten data for table
            const processedServices = servicesData.map(service => ({
                ...service,
                client_name: service.client ? (service.client.name || service.client) : "",
                // Flatten dynamic attributes
                ...(service.attributes || {})
            }));

            setServices(processedServices);
        } catch (error) {
            console.error("Error fetching services", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        // Re-use search if a client is selected, otherwise do nothing or handle accordingly
        if (selectedClient) {
            handleSearch();
        }
    };

    const handleEdit = (service) => {
        navigate(`/service/${service.id}`);
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
                    'Service has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting service", error);
                Swal.fire(
                    'Error!',
                    'There was an error deleting the service.',
                    'error'
                );
            }
        }
    };

    const handleViewFollowup = (service) => {
        navigate(`/followup?service_id=${service.id}&service_name=${encodeURIComponent(service.name)}`);
    };

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex items-center gap-2 mb-2 ml-2">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={String(client.id)}>
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={!selectedClient || loading}>
                    <Search className="mr-2 h-4 w-4" /> Search
                </Button>
                <Button onClick={() => navigate("/service/new", { state: { clientId: selectedClient } })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                <Table
                    data={services}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    verSeguimiento={handleViewFollowup}
                    searchable={true}
                />
            </div>
        </div>
    );
};
