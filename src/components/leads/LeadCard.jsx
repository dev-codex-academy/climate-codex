import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, User, Building } from "lucide-react";

export const LeadCard = ({ lead, salesUsers = [], onDragStart, onClick }) => {


    // Helper to get responsible name
    const getResponsibleName = () => {
        const resp = lead.responsible;
        if (!resp) return "Unassigned";

        // If it's an object with name/username
        if (typeof resp === 'object') {
            return resp.name || resp.username || "Unassigned";
        }

        // If it's a string that looks like a name (contains dot or space, or is just a username)
        // gracefully handle if it is a string ID
        if (typeof resp === 'string' && isNaN(parseInt(resp))) {
            return resp;
        }

        // If it's an ID (number or string number), look it up
        const userId = parseInt(resp);
        const user = salesUsers.find(u => u.id === userId);
        return user ? (user.name || user.username) : "Unassigned";
    };

    const getPossibleClientName = () => {
        const client = lead.possible_client;
        if (!client) return null;
        if (typeof client === 'object') return client.name || "Unknown Client";
        // If it's a string/number ID, we can't easily resolve it here without a list of clients.
        // Assuming backend might send expanded object or we just show "Client ID: ..." if strictly needed,
        // but typically for cards index the backend sends the name. 
        // If it sends just ID, we might need to skip or show placeholder. 
        return "Client #" + client;
    };

    return (
        <div
            onClick={() => onClick && onClick(lead)}
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="cursor-pointer hover:rotate-1 transition-transform duration-200"
        >
            <Card className="hover:shadow-md transition-shadow dark:bg-codex-fondo-terciario-variante2 bg-white border-none shadow-sm mb-3">
                <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-semibold truncate text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        {lead.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2 space-y-2">
                    {/* Amount & Prob */}


                    {/* Metadata */}
                    <div className="flex flex-col gap-1 text-[10px] text-codex-texto-secondary dark:text-codex-texto-dark-secondary">
                        {/* Responsible */}
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>
                                {getResponsibleName()}
                            </span>
                        </div>

                        {/* Date - checking different possible field names */}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{lead.created_at?.split('T')[0] || lead.date || "No date"}</span>
                        </div>

                        {getPossibleClientName() && (
                            <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                <span>{getPossibleClientName()}</span>
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div >
    );
};
