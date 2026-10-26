import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/date";
import { Plus, Download, Upload, X, CheckCircle, AlertCircle, Search, Trash2, Briefcase, UserCircle } from "lucide-react";
import { getClients, deleteClient, getClientAttributes, importClientsFromExcel, exportClientsExcel } from "../services/clientService";
import { getServices } from "../services/serviceService";
import { getContacts } from "../services/contactService";
import { CardPagination, PerPage } from "../components/cards/CardPagination";
import { cardButton, cardShell, gridStyle, inputStyle, paginate } from "../components/cards/cardStyles";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

// "2026-10-26" is shown as a date; booleans as Yes/No; anything else as text.
const displayValue = (attr, value) => {
    if (value === null || value === undefined || value === "") return "";
    if (attr.type === "date") return formatDate(value);
    if (attr.type === "boolean") return value ? "Yes" : "No";
    return String(value);
};

export const Client = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attributes, setAttributes] = useState([]);
    const [counts, setCounts] = useState({ services: {}, contacts: {} });
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(9);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const permissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
    const canDelete = permissions.includes("app.delete_client");

    // Import modal state
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

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
            setClients(clientsData.map(client => ({ ...client, ...(client.attributes || {}) })));
            setAttributes(attributesData);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
        // The counts on each card are a nicety: if they fail the list still works.
        try {
            const [services, contacts] = await Promise.all([getServices(), getContacts()]);
            const tally = (rows) => rows.reduce((acc, row) => {
                const key = String(typeof row.client === "object" ? row.client?.id : row.client);
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            setCounts({ services: tally(services), contacts: tally(contacts) });
        } catch (error) {
            console.error("Error fetching client counts", error);
        }
    };

    const handleDelete = async (client) => {
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
                await deleteClient(client.id);
                fetchData();
                Swal.fire('Deleted!', 'Client has been deleted.', 'success');
            } catch (error) {
                console.error("Error deleting client", error);
                Swal.fire('Error!', 'There was an error deleting the client.', 'error');
            }
        }
    };

    const handleExportExcel = async () => {
        try {
            const blob = await exportClientsExcel();
            saveAs(blob, "clients_report.xlsx");
        } catch (error) {
            console.error("Error exporting clients", error);
            Swal.fire('Error!', 'There was an error exporting the clients.', 'error');
        }
    };

    const openImportModal = () => {
        setImportResult(null);
        setSelectedFile(null);
        setShowImportModal(true);
    };

    const closeImportModal = () => {
        if (importing) return;
        setShowImportModal(false);
        setImportResult(null);
        setSelectedFile(null);
    };

    const handleImport = async () => {
        if (!selectedFile) return;
        setImporting(true);
        setImportResult(null);
        try {
            const result = await importClientsFromExcel(selectedFile);
            setImportResult(result);
            if (result.created > 0) fetchData();
        } catch (error) {
            Swal.fire('Import failed', error.message, 'error');
        } finally {
            setImporting(false);
        }
    };

    const allFields = [
        { name: 'name', label: 'Name', required: true },
        ...attributes.map(a => ({ name: a.name, label: a.label, required: a.is_required })),
    ];

    // Search matches the name and every custom field (region, category…), like the old table's filter.
    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        const sorted = [...clients].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        if (!needle) return sorted;
        return sorted.filter(c =>
            String(c.name || "").toLowerCase().includes(needle) ||
            attributes.some(a => displayValue(a, c[a.name]).toLowerCase().includes(needle)));
    }, [clients, attributes, search]);
    const { pageItems, currentPage } = paginate(filtered, page, pageSize);

    const outlineButton = {
        backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-brand)", color: "var(--c-brand)",
    };

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <div>
                    <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">Clients</p>
                    <p className="text-sm text-muted-foreground">Open a client to edit it and see its services, contacts and tasks.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleExportExcel} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer" style={outlineButton}>
                        <Download className="h-4 w-4" /> Export Excel
                    </button>
                    <button onClick={openImportModal} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer" style={outlineButton}>
                        <Upload className="h-4 w-4" /> Import Excel
                    </button>
                    <button onClick={() => navigate("/client/new")} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: "var(--c-cta)", color: "var(--c-on-dark)" }}>
                        <Plus className="h-4 w-4" /> Add Client
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ position: "relative", width: 300, maxWidth: "100%" }}>
                    <Search className="h-4 w-4" style={{ position: "absolute", left: 11, top: 11, color: "var(--c-hint)" }} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, region or category"
                        aria-label="Search clients" style={{ ...inputStyle, paddingLeft: 34, height: 38 }} />
                </div>
                <div style={{ marginLeft: "auto" }}><PerPage value={pageSize} onChange={n => { setPageSize(n); setPage(1); }} /></div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {loading && <p className="text-sm text-gray-500 p-2">Loading...</p>}
                {!loading && filtered.length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--c-muted)", fontSize: 14, border: "1px dashed var(--c-border)", borderRadius: 12 }}>
                        {clients.length === 0 ? "No clients yet." : "No clients match your search."}
                    </div>
                )}
                <div style={gridStyle}>
                    {pageItems.map(c => {
                        const filled = attributes.filter(a => displayValue(a, c[a.name]));
                        const nServices = counts.services[String(c.id)] || 0;
                        const nContacts = counts.contacts[String(c.id)] || 0;
                        return (
                            <article key={c.id} role="link" tabIndex={0} aria-label={`Open ${c.name}`}
                                onClick={() => navigate(`/client/${c.id}`)}
                                onKeyDown={e => { if (e.key === "Enter") navigate(`/client/${c.id}`); }}
                                style={{ ...cardShell(), cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--c-ink)", lineHeight: 1.2 }}>{c.name}</p>
                                    {canDelete && (
                                        <button onClick={e => { e.stopPropagation(); handleDelete(c); }} aria-label={`Delete ${c.name}`}
                                            style={{ ...cardButton(false), color: "var(--c-danger)", padding: "0 10px", height: 32, flexShrink: 0 }}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "grid", gap: 6 }}>
                                    {filled.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "var(--c-hint)" }}>No extra information.</p>}
                                    {filled.map(a => (
                                        <div key={a.name} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--c-muted)", minWidth: 0 }}>
                                            <span style={{ flexShrink: 0 }}>{a.label}</span>
                                            <span style={{ color: "var(--c-ink)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayValue(a, c[a.name])}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--c-divider)", fontSize: 13, color: "var(--c-muted)" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Briefcase className="h-3.5 w-3.5" /> <strong style={{ color: "var(--c-ink)" }}>{nServices}</strong> service{nServices === 1 ? "" : "s"}</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><UserCircle className="h-3.5 w-3.5" /> <strong style={{ color: "var(--c-ink)" }}>{nContacts}</strong> contact{nContacts === 1 ? "" : "s"}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            <CardPagination total={filtered.length} noun="client" page={currentPage} pageSize={pageSize} onPage={setPage} />

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[680px] max-h-[88vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--c-brand)]">Import Clients from Excel</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Upload your .xlsx file to bulk import clients</p>
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
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    <span className="text-red-500 font-semibold">*</span> required &nbsp;·&nbsp; Column headers must match exactly.
                                </p>
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
                                            {importResult.created} client(s) created successfully
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
                                disabled={!selectedFile || importing}
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
