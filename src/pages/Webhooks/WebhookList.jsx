import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit, Globe, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWebhooks, deleteWebhook } from "@/services/webhookService";
import Swal from 'sweetalert2';

export const WebhookList = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState("Lead");

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            const data = await getWebhooks();
            setWebhooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load webhooks',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await deleteWebhook(id);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Webhook has been deleted.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            loadWebhooks();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete webhook',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading webhooks...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your system webhooks and event listeners.
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="Service">Service</SelectItem>
                            <SelectItem value="FollowUp">FollowUp</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link to={`/webhook/new?model=${selectedModel}`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Webhook
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configured Webhooks</CardTitle>
                </CardHeader>
                <CardContent>
                    {webhooks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No webhooks configured. Click "Add Webhook" to create one.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Target URL</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {webhooks.map((webhook) => (
                                    <TableRow key={webhook.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-blue-500" />
                                                {webhook.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {webhook.model}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground max-w-[300px] truncate" title={webhook.url}>
                                                <Globe className="h-3 w-3 mr-1" />
                                                <span className="truncate">{webhook.method} {webhook.url}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={webhook.is_active ? "default" : "secondary"}>
                                                {webhook.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/webhook/${webhook.id}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(webhook.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div >
    );
};
