
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
                                {['leads', 'clients', 'services', 'pipelines', 'followups', 'webhooks', 'meta'].map((tab) => (
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
                                            </p>
                                            <CopyBlock text={`{
  "name": "New Student Lead",
  "stage": "Prospecting",
  "attributes": { "source": "Web" }
}`} />
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
                                    </div>
                                )}

                                {activeTab === 'services' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Services (Students)</h3>
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
                                            <p className="text-sm text-muted-foreground mb-4">Create a new pipeline with stages.</p>
                                            <CopyBlock text={`{
    "name": "B2B Sales",
    "stages": [
        {"name": "Prospecting", "color": "#6c6f73", "order": 1},
        {"name": "Negotiation", "color": "#007bff", "order": 2}
    ]
}`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'followups' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Follow Ups</h3>
                                        <p className="text-sm text-muted-foreground">Interactions logged against a specific Service (Student).</p>

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
                                    </div>
                                )}

                                {activeTab === 'webhooks' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhooks</h3>
                                        <p className="text-sm text-muted-foreground">Receive real-time notifications for system events.</p>

                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge>POST</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/webhooks/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">Register a new webhook.</p>
                                            <CopyBlock text={`{
    "name": "Lead Sync",
    "model": "Lead",
    "url": "https://external.app/hook/{id}",
    "method": "POST",
    "is_active": true
}`} />
                                            <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                                <strong>Template Substitution:</strong> You can use placeholders like <code>{`{id}`}</code> or <code>{`{name}`}</code> in the URL and Headers.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'meta' && (
                                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                                        <h3 className="text-lg font-semibold">Metadata & Attributes</h3>
                                        <div className="p-4 border rounded-md bg-white dark:bg-slate-950">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline">GET</Badge>
                                                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">/api/attributes/{'{entity}'}/</code>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Get schema/attributes for an entity.
                                                <br />
                                                Entity options: <code>client</code>, <code>service</code>, <code>lead</code>, <code>follow_up</code>.
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
