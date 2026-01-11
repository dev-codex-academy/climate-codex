import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEnrollmentDetails, createEnrollmentDetail } from "@/services/enrollmentDetailService";
import { searchServices, getServiceAttributes, getServiceById } from "@/services/serviceService";
import { getClientById } from "@/services/clientService";
import { getEnrollments } from "@/services/enrollmentService";
import { getCohort } from "@/services/cohortService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table } from "@/components/Table";
import { Search, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const EnrollmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Assuming we might need user info
    const [enrollment, setEnrollment] = useState(null);
    const [cohortName, setCohortName] = useState("");
    const [details, setDetails] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchedService, setSearchedService] = useState(null);
    const [searchedClient, setSearchedClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch basic enrollment info to display (Optional, if we want to show "Enrollment for Cohort X")
    // Note: Ideally we have an endpoint to get single enrollment. 
    // Reusing getEnrollments() and filtering for now as createEnrollmentDetail doesn't return parent info?
    // Wait, getEnrollments returns all. We can filter. 
    // Or assumming we passed state. But let's fetch to be safe.

    useEffect(() => {
        const fetchEnrollmentInfo = async () => {
            // Fetch all enrollments to find the current one for display context
            // Optimization: Add getEnrollment(id) to service.
            try {
                const all = await getEnrollments();
                const found = all.find(e => String(e.id) === id);
                setEnrollment(found);

                if (found && found.cohort) {
                    // Check if cohort is object or ID
                    if (typeof found.cohort === 'object') {
                        setCohortName(found.cohort.name_cohort || found.cohort.name);
                    } else {
                        // Fetch cohort name
                        try {
                            const cohortData = await getCohort(found.cohort);
                            setCohortName(cohortData.name_cohort || cohortData.name);
                        } catch (err) {
                            console.error("Error fetching cohort", err);
                            setCohortName("Unknown Cohort");
                        }
                    }
                }
            } catch (e) { console.error(e) }
        };
        const fetchAttrs = async () => {
            try {
                const attrs = await getServiceAttributes();
                setAttributes(attrs);
            } catch (e) { console.error("Error fetching attributes", e); }
        };

        fetchEnrollmentInfo();
        fetchAttrs();
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getEnrollmentDetails(id);

            // Fetch student info for each detail
            const enrichedData = await Promise.all(data.map(async (item) => {
                // Backend returns 'student' as ID (based on user info)
                // or maybe 'service' if they didn't rename it in the output yet?
                // User said "student_id" in DB screenshot.
                // But typically DRF serializer field name depends on serializer.
                // User sent payload with 'student'.
                // Let's assume the field in 'data' is 'student' (the ID).

                const studentId = item.student || item.service;
                if (studentId) {
                    try {
                        const serviceInfo = await getServiceById(studentId);
                        // We want to keep the EnrollmentDetail ID for deletion/management
                        // But show attributes from the service.
                        // We merge serviceInfo to get 'name', 'attributes', etc.
                        // But PRESERVE the 'id' of the enrollment detail.
                        return {
                            ...serviceInfo, // Service info (has 'attributes', 'name', etc)
                            ...item,        // Enrollment Detail (has 'id', 'enrollment', 'student')
                            // Ensure existing detail props override service props if needed,
                            // EXCEPT for attributes we want from service.
                            attributes: serviceInfo.attributes || item.attributes
                        };
                    } catch (err) {
                        console.error("Error fetching student details", err);
                        return item;
                    }
                }
                return item;
            }));

            setDetails(enrichedData);
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setSearchLoading(true);
        setSearchedService(null);
        setSearchedClient(null);
        try {
            const results = await searchServices(searchTerm);
            if (results && results.length > 0) {
                const service = results[0];
                setSearchedService(service);

                // Fetch associated client if exists
                if (service.client) {
                    try {
                        const clientData = await getClientById(service.client);
                        setSearchedClient(clientData);
                    } catch (err) {
                        console.error("Error fetching client", err);
                    }
                }
            } else {
                setSearchedService(null);
            }
        } catch (error) {
            console.error("Error searching service:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddService = async () => {
        if (!searchedService) return;
        try {
            const payload = {
                enrollment: id, // Send ID as string (UUID)
                student: searchedService.id // Param name is 'student'
            };
            await createEnrollmentDetail(payload);
            setSearchedService(null);
            setSearchedClient(null);
            setSearchTerm("");
            fetchDetails();
        } catch (error) {
            console.error("Error adding service:", error);
        }
    };

    const attributeColumns = attributes.map(attr => ({
        key: attr.name || attr,
        label: attr.name || attr,
    }));

    const columns = [
        { key: "id", label: "ID" },
        ...attributeColumns
    ];

    // transform for table
    const tableData = details.map(d => {
        const flattened = { ...d };
        if (d.attributes) {
            Object.keys(d.attributes).forEach(key => {
                flattened[key] = d.attributes[key];
            });
        }
        return flattened;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Enrollment Details</h1>
                    {enrollment && <p className="text-muted-foreground">{cohortName} - {enrollment.pathway_name}</p>}
                </div>
                <Button variant="outline" onClick={() => navigate("/enrollment")}>Back to List</Button>
            </div>

            {/* Search Section */}
            <div className="flex gap-4 items-end">
                <div className="w-full max-w-sm space-y-2">
                    <label className="text-sm font-medium">Search to Add</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={searchLoading}>
                            {searchLoading ? "Searching..." : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reference Card */}
            {searchedService && (
                <div className="max-w-md animate-in fade-in-0 slide-in-from-top-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{searchedService.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">{searchedService.description || "No description available"}</p>
                            {searchedClient && (
                                <div className="mt-2 text-sm">
                                    <span className="font-semibold">Client: </span>
                                    {searchedClient.name || `${searchedClient.first_name || ''} ${searchedClient.last_name || ''}`}
                                </div>
                            )}
                            {/* Display other relevant fields if any */}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleAddService} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Enrollment
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Report Table */}
            <div className="border rounded-md">
                <Table
                    data={tableData}
                    columns={columns}
                    searchable={false}
                />
            </div>

        </div>
    );
};
