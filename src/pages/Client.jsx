import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { Button } from "../components/ui/button";
import { Plus, Download, Upload, HelpCircle } from "lucide-react";
import { getClients, deleteClient, getClientAttributes, importClientsFromExcel } from "../services/clientService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

export const Client = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attributes, setAttributes] = useState([]);
    const [showHelp, setShowHelp] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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
        navigate(`/client/${client.id}`);
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

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        setImporting(true);
        try {
            const result = await importClientsFromExcel(file);
            const errorLines = result.errors.length > 0
                ? `<br/><br/><b>Errors (${result.errors.length}):</b><br/>` +
                  result.errors.map(err => `Row ${err.row}: ${err.reason}`).join('<br/>')
                : '';
            Swal.fire({
                title: 'Import complete',
                html: `<b>${result.created}</b> client(s) created successfully.${errorLines}`,
                icon: result.created > 0 ? 'success' : 'warning',
            });
            fetchData();
        } catch (error) {
            Swal.fire('Import failed', error.message, 'error');
        } finally {
            setImporting(false);
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

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Clients
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your clients and view their details.
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                        style={{ backgroundColor: "#F2EBDD", border: "1px solid #5E6A43", color: "#5E6A43" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(94,106,67,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#F2EBDD"}
                    >
                        <Download className="h-4 w-4" /> Export Excel
                    </button>

                    {/* Import Excel + Help */}
                    <div className="relative flex items-center gap-1">
                        <input
                            type="file"
                            accept=".xlsx"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={importing}
                            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            style={{ backgroundColor: "#F2EBDD", border: "1px solid #5E6A43", color: "#5E6A43" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(94,106,67,0.15)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#F2EBDD"}
                        >
                            <Upload className="h-4 w-4" /> {importing ? 'Importing...' : 'Import Excel'}
                        </button>
                        <button
                            onClick={() => setShowHelp(v => !v)}
                            className="h-7 w-7 flex items-center justify-center rounded-full text-[#5E6A43] hover:bg-[rgba(94,106,67,0.15)] transition-colors cursor-pointer"
                            title="Excel format help"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </button>

                        {showHelp && (
                            <div className="absolute right-0 top-10 z-50 w-72 rounded-lg shadow-lg border border-[#5E6A43] bg-white p-4 text-sm text-gray-700">
                                <p className="font-semibold mb-2 text-[#5E6A43]">Expected Excel columns:</p>
                                <ul className="space-y-1">
                                    <li><span className="font-mono bg-gray-100 px-1 rounded">name</span> <span className="text-red-500 text-xs">required</span></li>
                                    {attributes.map(attr => (
                                        <li key={attr.name}>
                                            <span className="font-mono bg-gray-100 px-1 rounded">{attr.name}</span>
                                            {attr.is_required && <span className="text-red-500 text-xs ml-1">required</span>}
                                            <span className="text-gray-400 text-xs ml-1">({attr.label})</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-400 mt-3">Column headers must match exactly.</p>
                            </div>
                        )}
                    </div>

                    <Button onClick={() => navigate("/client/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Add Client
                    </Button>
                </div>
            </div>

            <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                <Table
                    data={clients}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    searchable={true}
                />
            </div>
        </div>
    );
};
