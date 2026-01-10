import React, { useState, useEffect } from "react";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus, Download } from "lucide-react";
import { getClients, deleteClient, getClientAttributes } from "../services/clientService";
import { ClientModal } from "../components/clients/ClientModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

export const Client = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [attributes, setAttributes] = useState([]);

    const staticColumns = [
        { key: "name", label: "Name" },
    ];

    const [columns, setColumns] = useState(staticColumns);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsData, attributesData] = await Promise.all([
                getClients(),
                getClientAttributes()
            ]);
            const processedClients = clientsData.map(client => ({
                ...client,
                ...(client.attributes || {})
            }));
            setClients(processedClients);
            setAttributes(attributesData);

            // Dynamic columns from attributes
            const dynamicColumns = attributesData.map(attr => ({
                key: attr.name, // The backend key/name for the attribute
                label: attr.label
            }));

            setColumns([...staticColumns, ...dynamicColumns]);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client) => {
        setClientToEdit(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (client) => {
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
                await deleteClient(client.id);
                fetchData(); // Refresh both to be safe, though just clients is enough
                Swal.fire(
                    'Deleted!',
                    'Client has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting client", error);
                Swal.fire(
                    'Error!',
                    'There was an error deleting the client.',
                    'error'
                );
            }
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(clients);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "clients_report.xlsx");
    };

    const handleClientSaved = () => {
        fetchData();
    };

    const openNewClientModal = () => {
        setClientToEdit(null);
        setIsModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col p-4 w-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your clients and view their details.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                    <Button onClick={openNewClientModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Client
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-codex-fondo-secondary p-4 rounded-lg shadow h-full overflow-hidden flex flex-col">
                <Table
                    data={clients}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    searchable={true}
                />
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientSaved={handleClientSaved}
                clientToEdit={clientToEdit}
                attributes={attributes}
            />
        </div>
    );
};
