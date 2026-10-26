import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { formatDate } from "../utils/date";
import { Plus, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { getServices, deleteService, getServiceAttributes, importServicesFromExcel } from "../services/serviceService";
import { getClients } from "../services/clientService";
import { getCohorts } from "../services/cohortService";
import Swal from "sweetalert2";

const FIXED_FIELDS = [
    { name: 'name',   label: 'Name',   required: true },
    { name: 'status', label: 'Status', required: false, hint: 'active / paused / cancelled' },
    { name: 'origin_cohort', label: 'Origin Cohort', required: false, hint: 'Cohort name, not id' },
    { name: 'actual_cohort', label: 'Actual Cohort', required: false, hint: 'Cohort name, not id' },
];

export const Service = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [clients, setClients] = useState([]);
    const navigate = useNavigate();

    // Import modal state
    const [showImportModal, setShowImportModal] = useState(false);
    const [importClientId, setImportClientId] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // The client sits next to the name as a plain column. Client and cohorts are stored as ids, so the row
    // carries their resolved names (client_name, origin_cohort_name, actual_cohort_name): that is what the
    // table's search box matches against, so any service can be found by client or cohort name too.
    const staticColumns = [
        { key: "name", label: "Name" },
        { key: "client_name", label: "Client" },
        { key: "linked_email", label: "Email" },
        { key: "linked_phone", label: "Phone" },
        { key: "linked_date_of_birth", label: "Date of Birth", render: (value) => formatDate(value) },
    ];

    const [columns, setColumns] = useState(staticColumns);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Every service is loaded at once: no client has to be picked first, and the search box filters them all.
    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesData, attributesData, clientsData, cohortsData] = await Promise.all([
                getServices(),
                getServiceAttributes(),
                getClients(),
                getCohorts(),
            ]);
            setAttributes(attributesData);
            setClients(clientsData);

            const clientsById = {};
            clientsData.forEach(c => { clientsById[String(c.id)] = c.name; });
            const cohortsList = Array.isArray(cohortsData) ? cohortsData : (cohortsData.results || []);
            const cohortsById = {};
            cohortsList.forEach(c => { cohortsById[String(c.id)] = c.name; });

            setServices(servicesData.map(service => ({
                ...service,
                client_name: clientsById[String(typeof service.client === "object" ? service.client?.id : service.client)] || "",
                origin_cohort_name: cohortsById[String(service.origin_cohort)] || "",
                actual_cohort_name: cohortsById[String(service.actual_cohort)] || "",
                ...(service.attributes || {}),
            })));

            const dynamicColumns = attributesData.map(attr => ({
                key: attr.name,
                label: attr.label,
                ...(attr.type === 'date' ? { render: (value) => formatDate(value) } : {}),
            }));
            const cohortColumns = [
                { key: "origin_cohort_name", label: "Origin Cohort", render: (value) => value || "—" },
                { key: "actual_cohort_name", label: "Actual Cohort", render: (value) => value || "—" },
            ];
            setColumns([...staticColumns, ...cohortColumns, ...dynamicColumns]);
        } catch (error) {
            console.error("Error fetching services", error);
        } finally {
            setLoading(false);
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
            confirmButtonColor: 'var(--c-brand)',
            cancelButtonColor: 'var(--c-cta)',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteService(service.id);
                fetchData();
                Swal.fire('Deleted!', 'Service has been deleted.', 'success');
            } catch (error) {
                console.error("Error deleting service", error);
                Swal.fire('Error!', 'There was an error deleting the service.', 'error');
            }
        }
    };

    const handleViewFollowup = (service) => {
        navigate(`/followup?service_id=${service.id}&service_name=${encodeURIComponent(service.name)}`);
    };

    const openImportModal = () => {
        setImportResult(null);
        setSelectedFile(null);
        setImportClientId('');
        setClientSearch('');
        setShowImportModal(true);
    };

    const closeImportModal = () => {
        if (importing) return;
        setShowImportModal(false);
        setImportResult(null);
        setSelectedFile(null);
        setImportClientId('');
        setClientSearch('');
    };

    const handleImport = async () => {
        if (!importClientId || !selectedFile) return;
        setImporting(true);
        setImportResult(null);
        try {
            const result = await importServicesFromExcel(importClientId, selectedFile);
            setImportResult(result);
            if (result.created > 0) fetchData();
        } catch (error) {
            Swal.fire('Import failed', error.message, 'error');
        } finally {
            setImporting(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
    );

    const allFields = [
        ...FIXED_FIELDS,
        ...attributes.map(a => ({ name: a.name, label: a.label, required: a.is_required })),
    ];

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-2 ml-2">
                <button
                    onClick={openImportModal}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-brand)", color: "var(--c-brand)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--c-brand) 15%, transparent)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--c-surface-2)"}
                >
                    <Upload className="h-4 w-4" /> Import Excel
                </button>
                <button
                    onClick={() => navigate("/service/new")}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--c-brand-strong)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--c-brand)"}
                >
                    <Plus className="h-4 w-4" /> Add Service
                </button>
            </div>

            <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                {loading && <p className="text-sm p-2" style={{ color: "var(--c-muted)" }}>Loading services...</p>}
                <Table
                    data={services}
                    columns={columns}
                    onEdit={handleEdit}
                    onAskDelete={handleDelete}
                    verSeguimiento={handleViewFollowup}
                    searchable={true}
                    searchPlaceholder="Search any service..."
                />
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[680px] max-h-[88vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--c-brand)]">Import Services from Excel</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Select a client and upload your .xlsx file</p>
                            </div>
                            <button onClick={closeImportModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">

                            {/* Expected columns */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Expected Excel columns:</p>
                                <div className="flex flex-wrap gap-2">
                                    {allFields.map(f => (
                                        <span key={f.name} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5 text-xs font-mono text-gray-700">
                                            {f.name}
                                            {f.required && <span className="text-red-500 font-sans font-semibold">*</span>}
                                            {f.hint && <span className="text-gray-400 font-sans normal-case ml-1">({f.hint})</span>}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    <span className="text-red-500 font-semibold">*</span> required &nbsp;·&nbsp; Column headers must match exactly.
                                </p>
                            </div>

                            {/* Client selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Select Client <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-400 mb-2">All services in the file will be assigned to this client.</p>
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={clientSearch}
                                    onChange={e => setClientSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-[var(--c-brand)]"
                                />
                                <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto">
                                    {filteredClients.length === 0 ? (
                                        <p className="text-xs text-gray-400 p-3">No clients found</p>
                                    ) : filteredClients.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setImportClientId(c.id)}
                                            className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
                                                importClientId === c.id
                                                    ? 'bg-[var(--c-brand)] text-white'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Excel File (.xlsx) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx"
                                    onChange={e => { setSelectedFile(e.target.files[0] || null); setImportResult(null); }}
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-[var(--c-brand)] transition-colors"
                                >
                                    {selectedFile ? (
                                        <p className="text-sm text-[var(--c-brand)] font-medium">{selectedFile.name}</p>
                                    ) : (
                                        <p className="text-sm text-gray-400">Click to select a file</p>
                                    )}
                                </div>
                            </div>

                            {/* Results */}
                            {importResult && (
                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                    <div className={`px-4 py-3 flex items-center gap-2 ${importResult.created > 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                        {importResult.created > 0
                                            ? <CheckCircle className="h-4 w-4 text-green-600" />
                                            : <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        }
                                        <span className="text-sm font-semibold text-gray-700">
                                            {importResult.created} service(s) created successfully
                                            {importResult.errors.length > 0 && `, ${importResult.errors.length} row(s) skipped`}
                                        </span>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 border-t border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500 w-16">Row</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-gray-500">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importResult.errors.map((err, i) => (
                                                    <tr key={i} className="border-t border-gray-100">
                                                        <td className="px-4 py-2 text-red-500 font-medium">{err.row}</td>
                                                        <td className="px-4 py-2 text-gray-600">{err.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeImportModal}
                                disabled={importing}
                                className="h-9 px-4 rounded-lg text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {importResult ? 'Close' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importClientId || !selectedFile || importing}
                                className="h-9 px-5 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: "var(--c-brand)" }}
                            >
                                {importing ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
