import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, User, DollarSign } from "lucide-react";

export const LeadCard = ({ lead, onDragStart, onClick }) => {
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
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
                    <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="w-3 h-3" />
                            {/* Assuming 'amount' is in attributes or root */}
                            {formatCurrency(lead.attributes?.monto || lead.amount)}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1 h-5">
                            {lead.attributes?.prob || lead.probability || '0'}%
                        </Badge>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-1 text-[10px] text-codex-texto-secondary dark:text-codex-texto-dark-secondary">
                        {/* Responsible */}
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{lead.responsible_name || "Unassigned"}</span>
                        </div>
                        {/* Date - checking different possible field names */}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{lead.created_at?.split('T')[0] || lead.date || "No date"}</span>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
