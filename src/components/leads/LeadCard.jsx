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
            className="group/card cursor-pointer transition-all duration-300 active:scale-[0.98]"
        >
            <Card className="hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:bg-codex-fondo-secondary bg-white border border-codex-bordes-primary-variante2/30 dark:border-codex-bordes-terciario-variante4/30 shadow-sm mb-0 transition-all group-hover/card:-translate-y-1">
                <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xs font-bold leading-tight line-clamp-2 text-codex-texto-secondary dark:text-white uppercase tracking-tight">
                        {lead.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-3">
                    {/* Metadata */}
                    <div className="grid grid-cols-1 gap-2">
                        {/* Responsible */}
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-codex-fondo-primary-variante1/50 dark:bg-codex-fondo-terciario-variante5/50 border border-codex-bordes-primary-variante2/20 dark:border-codex-bordes-terciario-variante4/20">
                            <div className="h-4 w-4 rounded-full bg-codex-primary flex items-center justify-center text-[7px] font-black text-white shrink-0 shadow-sm">
                                {getResponsibleName().charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[9px] font-bold text-codex-texto-secondary dark:text-codex-texto-terciario-variante1 truncate">
                                {getResponsibleName()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-medium px-1">
                            {/* Date */}
                            <div className="flex items-center gap-1.5 ">
                                <Calendar className="w-2.5 h-2.5 opacity-70" />
                                <span>{lead.created_at?.split('T')[0] || lead.date || "No date"}</span>
                            </div>

                            {getPossibleClientName() && (
                                <div className="flex items-center gap-1.5 max-w-[50%]">
                                    <Building className="w-2.5 h-2.5 opacity-70" />
                                    <span className="truncate">{getPossibleClientName()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
};
