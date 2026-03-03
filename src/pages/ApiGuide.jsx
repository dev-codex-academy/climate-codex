
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Terminal, Shield, Database, Layout, Webhook, ArrowLeft, Network } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const ApiGuide = () => {
    const [activeTab, setActiveTab] = useState("leads");
    const navigate = useNavigate();

    const CopyBlock = ({ text }) => {

        const handleCopy = () => {
            navigator.clipboard.writeText(text);
        };

        return (
            <div className="relative group mt-2">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800">
                    {text}
                </pre>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={handleCopy}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Terminal className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">API Integration Guide</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Documentation for accessing CRM data programmatically.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>

                {/* Authentication */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <CardTitle>Authentication</CardTitle>
                        </div>
                        <CardDescription>
                            All API requests must be authenticated using a simplified Token-based mechanism.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold mb-2">1. Obtain a Token</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Send a POST request with your credentials to receive an authentication token.
                            </p>
                            <CopyBlock text={`curl -X POST https://dev.codexcrm.click/api-token-auth/ \\
-H "Content-Type: application/json" \\
-d '{
  "username": "YOUR_USERNAME",
  "password": "YOUR_PASSWORD"
}'`} />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold mb-2">2. Use the Token</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Include the token in the <code>Authorization</code> header of subsequent requests.
                            </p>
                            <CopyBlock text={`Authorization: Token YOUR_TOKEN_HERE`} />
                        </div>
                    </CardContent>
                </Card>

                {/* Main Resources */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-blue-600" />
                            <CardTitle>Resources Directory</CardTitle>
                        </div>
                        <CardDescription>
                            Browse detailed documentation for each resource.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Sidebar Tabs */}
                            <div className="w-full md:w-1/4 space-y-1">
                                {['leads', 'clients', 'contacts', 'services', 'pipelines', 'followups', 'catalogue', 'invoices', 'attributes'].map((tab) => (
                                    <Button
                                        key={tab}
                                        variant={activeTab === tab ? "secondary" : "ghost"}
                                        onClick={() => setActiveTab(tab)}
                                        className="w-full justify-start capitalize"
                                    >
                                        {tab.replace('followups', 'Follow Ups')}
                                    </Button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="w-full md:w-3/4 min-h-[400px]">
                                {activeTab === 'leads' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Leads (Opportunities)</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/leads/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Retrieve a paginated list of leads.
                                            </p>
                                            <CopyBlock text={`curl -X GET https://dev.codexcrm.click/api/leads/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/leads/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a new lead.
                                                <br /><br />
                                                <strong>Note:</strong> Leads use three distinct attribute groups to group fields better: <code>attributes</code> (for the lead itself), <code>client_attributes</code> (for future client info), and <code>service_attributes</code> (for desired services).
                                            </p>
                                            <CopyBlock text={`{
  "name": "New Service Lead",
  "stage": "Prospecting",
  "lost_reason": "Price (Required if stage is Lost)", 
  "attributes": { "source": "Web" },
  "client_attributes": { "age": 25, "location": "NY" },
  "service_attributes": [
    { "name": "Course A", "cost": 100, "quantity": 1 }
  ]
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PUT</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/leads/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Update an existing lead.
                                            </p>
                                            <CopyBlock text={`{
  "stage": "Lost",
  "lost_reason": "Budget constraints (Required)",
  "name": "Updated Name"
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/leads/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Delete a lead.
                                            </p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/leads/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'clients' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Clients</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/clients/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                List all clients. Supports filtering by name.
                                            </p>
                                            <CopyBlock text={`curl -X GET "https://dev.codexcrm.click/api/clients/?name=Acme" \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/clients/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a new client.
                                            </p>
                                            <CopyBlock text={`{
  "name": "Acme Corp",
  "attributes": {
    "industry": "Tech"
  }
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PUT</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/clients/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Update client details.
                                            </p>
                                            <CopyBlock text={`{
  "name": "Acme Inc",
  "attributes": {
    "industry": "Finance"
  }
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/clients/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Delete a client.
                                            </p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/clients/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'contacts' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Contacts</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/contacts/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                List all contacts. Supports filtering by client or name.
                                            </p>
                                            <CopyBlock text={`curl -X GET "https://dev.codexcrm.click/api/contacts/?client={client_uuid}" \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/contacts/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a new contact.
                                            </p>
                                            <CopyBlock text={`{
  "client": "client-uuid",
  "first_name": "Maria",
  "last_name": "Lopez",
  "email": "m.lopez@example.com",
  "is_primary": true
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PATCH</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/contacts/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Update a contact.
                                            </p>
                                            <CopyBlock text={`{
  "job_title": "CEO",
  "is_primary": true
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/contacts/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Delete a contact.
                                            </p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/contacts/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'services' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Services</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/services/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Retrieve services provided to clients.
                                            </p>
                                            <CopyBlock text={`curl -X GET https://dev.codexcrm.click/api/services/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/services/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a service.
                                            </p>
                                            <CopyBlock text={`{
  "name": "Jane Doe",
  "client": "client-uuid",
  "attributes": {
    "program": "Full Stack"
  }
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PUT</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/services/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Update service details.
                                            </p>
                                            <CopyBlock text={`{
  "name": "Jane Doe Smith",
  "attributes": {
    "program": "Data Science"
  }
}`} />
                                        </div>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/services/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Delete a service.
                                            </p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/services/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pipelines' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold flex items-center gap-2"><Network className="h-5 w-5" /> Pipelines</h3>
                                        <p className="text-sm text-muted-foreground">Manage sales processes and stages.</p>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/pipelines/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List all configured pipelines.</p>
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/pipelines/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Create a new pipeline with stages.
                                                <br /><br />
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>"Won" and "Lost" stages are <strong>automatically appended</strong> (Order 99 & 100).</li>
                                                    <li>Do <strong>not</strong> include stages named "Won" or "Lost" in your payload.</li>
                                                    <li>Maximum of 98 custom stages allowed.</li>
                                                </ul>
                                            </p>
                                            <CopyBlock text={`{
    "name": "B2B Sales",
    "stages": [
        {"name": "Prospecting", "color": "#6c6f73", "order": 1},
        {"name": "Negotiation", "color": "#007bff", "order": 2}
    ]
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PUT</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/pipelines/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Update a pipeline.</p>
                                            <CopyBlock text={`{
    "name": "B2B Sales V2",
    "stages": [
        {"name": "Qualification", "color": "#6c6f73", "order": 1},
        {"name": "Closed", "color": "#28a745", "order": 2}
    ]
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/pipelines/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Delete a pipeline.</p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/pipelines/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'followups' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Follow Ups</h3>
                                        <p className="text-sm text-muted-foreground">Interactions logged against a specific Service.</p>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/services/{'{service_id}'}/follow-ups/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List follow-ups for a specific service.</p>
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/services/{'{service_id}'}/follow-ups/</code>
                                            </div>
                                            <CopyBlock text={`{
    "follow_up_date": "2025-01-15T10:00:00Z",
    "comment": "Sent brochure.",
    "attributes": { "channel": "email" }
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PUT</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/services/{'{service_id}'}/follow-ups/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Update a follow-up interaction.</p>
                                            <CopyBlock text={`{
    "comment": "Sent updated brochure and pricing.",
    "follow_up_date": "2025-01-16T10:00:00Z"
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/services/{'{service_id}'}/follow-ups/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Delete a follow-up.</p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/services/{service_id}/follow-ups/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'catalogue' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Catalogue & Categories</h3>
                                        <p className="text-sm text-muted-foreground">Manage products, services, subscriptions, and their categories.</p>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/categories/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List product and service categories.</p>
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/categories/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Create a new category.</p>
                                            <CopyBlock text={`{
  "name": "Software",
  "description": "Software products",
  "parent": null
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/catalogue/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List catalogue items. Supports filtering by category or type.</p>
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/catalogue/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Create a new catalogue item.</p>
                                            <CopyBlock text={`{
  "category": "category-uuid",
  "name": "Web Development",
  "type": "service",
  "base_price": "100.00",
  "currency": "USD",
  "unit": "hour",
  "is_active": true
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PATCH</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/catalogue/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Update a catalogue item.</p>
                                            <CopyBlock text={`{
  "base_price": "120.00"
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="destructive">DELETE</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/catalogue/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Delete a catalogue item.</p>
                                            <CopyBlock text={`curl -X DELETE https://dev.codexcrm.click/api/catalogue/{uuid}/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/inventory/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List inventory for physical products.</p>
                                        </div>

                                        <h4 className="text-md font-semibold mt-6 mb-2">Base Fields Guide</h4>
                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-l-blue-400">
                                                <h5 className="text-sm font-semibold mb-2">Category Fields</h5>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    <li><code className="text-slate-800 dark:text-slate-200">name</code>: The name of the category.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">description</code>: Details about the category's purpose.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">parent</code>: UUID of a parent category, used to create subcategories.</li>
                                                </ul>
                                            </div>
                                            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-l-purple-400">
                                                <h5 className="text-sm font-semibold mb-2">Catalogue Item Fields</h5>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    <li><code className="text-slate-800 dark:text-slate-200">name</code>: The name of the product or service.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">type</code>: The type of item (product, service, or subscription).</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">base_price</code> & <code className="text-slate-800 dark:text-slate-200">currency</code>: The standard price and currency.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">unit</code>: The unit of measure (e.g., hour, seat, month).</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">tax_rate</code>: The default tax percentage for this item.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">inventory</code>: Optional UUID linking to physical stock records.</li>
                                                </ul>
                                            </div>
                                            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-l-amber-400">
                                                <h5 className="text-sm font-semibold mb-2">Inventory Fields</h5>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    <li><code className="text-slate-800 dark:text-slate-200">sku</code>: Unique Stock Keeping Unit for tracking physical items.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">quantity_on_hand</code>: The current available stock.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">reorder_level</code>: The stock threshold that triggers a restock warning.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">location</code>: The physical location of the stock (e.g., Aisle 4).</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'invoices' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Invoices & Payments</h3>
                                        <p className="text-sm text-muted-foreground">Billing, invoicing, and payment tracking.</p>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/invoices/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">List invoices.</p>
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/invoices/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Create a draft invoice.</p>
                                            <CopyBlock text={`{
  "client": "client-uuid",
  "status": "draft",
  "issue_date": "2026-02-26",
  "due_date": "2026-03-26",
  "currency": "USD"
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">PATCH</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/invoices/{'{uuid}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Update an invoice status.</p>
                                            <CopyBlock text={`{
  "status": "sent"
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/invoices/{'{invoice_uuid}'}/line-items/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Add a line item to an invoice.</p>
                                            <CopyBlock text={`{
  "catalogue_item": "item-uuid",
  "description": "Web Development - 20 hours",
  "quantity": "20.00",
  "unit_price": "100.00",
  "tax_rate": "15.00"
}`} />
                                        </div>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/invoices/{'{invoice_uuid}'}/payments/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Record a payment for an invoice.</p>
                                            <CopyBlock text={`{
  "amount": "2300.00",
  "method": "bank_transfer",
  "paid_at": "2026-03-01T10:00:00Z",
  "reference": "WIRE-2026-001"
}`} />
                                        </div>

                                        <h4 className="text-md font-semibold mt-6 mb-2">Base Fields Guide</h4>
                                        <div className="space-y-4">
                                            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-l-emerald-400">
                                                <h5 className="text-sm font-semibold mb-2">Invoice Fields</h5>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    <li><code className="text-slate-800 dark:text-slate-200">client</code> & <code className="text-slate-800 dark:text-slate-200">contact</code>: The entities responsible for the invoice.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">status</code>: The current state (draft, sent, paid, overdue, void).</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">issue_date</code> & <code className="text-slate-800 dark:text-slate-200">due_date</code>: Billing timelines.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">subtotal</code>, <code className="text-slate-800 dark:text-slate-200">tax_amount</code>, <code className="text-slate-800 dark:text-slate-200">discount</code>, <code className="text-slate-800 dark:text-slate-200">total</code>: Auto-calculated financial summaries.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">amount_paid</code>: Total amount covered by registered payments.</li>
                                                </ul>
                                            </div>
                                            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 border-l-4 border-l-indigo-400">
                                                <h5 className="text-sm font-semibold mb-2">Invoice Line Item Fields</h5>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                    <li><code className="text-slate-800 dark:text-slate-200">catalogue_item</code>: Optional reference to a predefined product/service.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">description</code>: Specific details of what is being charged.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">quantity</code> & <code className="text-slate-800 dark:text-slate-200">unit_price</code>: Used to calculate the line subtotal.</li>
                                                    <li><code className="text-slate-800 dark:text-slate-200">tax_rate</code>: Tax percentage applicable to this specific line.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}



                                {activeTab === 'attributes' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Attributes & Metadata</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/attributes/{'{entity}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Get schema/attributes for an entity.
                                                <br />
                                                Entity options: <code>client</code>, <code>contact</code>, <code>service</code>, <code>lead</code>, <code>follow_up</code>, <code>category</code>, <code>catalogue_item</code>, <code>invoice</code>, <code>payment</code>.
                                            </p>
                                            <CopyBlock text={`curl -X GET https://dev.codexcrm.click/api/attributes/lead/ \\
-H "Authorization: Token YOUR_TOKEN"`} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};
