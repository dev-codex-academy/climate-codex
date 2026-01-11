import React, { useMemo } from "react";
import { Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const CohortList = ({
    data,
    onEdit,
    onDelete,
    onAdd,
    instructors = []
}) => {

    const columns = useMemo(() => [
        { key: "name_cohort", label: "Name" },
        {
            key: "instructor",
            label: "Instructor",
            // Custom render to show name instead of ID
            render: (val) => {
                const instr = instructors.find(i => i.id === val);
                return instr ? instr.name || instr.username || instr.email : val;
            }
        },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
    ], [instructors]);

    // Processing data to include instructor name if needed, 
    // but the Table component might not support custom render function in column definition easily 
    // based on my reading of Table.jsx (it has specific checks for 'activo', 'isDateKey', etc).
    // So I should pre-process the data before passing to Table, or use the Table's behavior.
    // Let's re-read Table.jsx. 
    // It says: `const val = row[col.key];` and then `return String(val ?? "");`.
    // It does NOT seem to support custom render functions in columns prop.
    // So I must map the data before passing it to Table.

    const formattedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            instructor_name: instructors.find(i => i.id === item.instructor)?.name || instructors.find(i => i.id === item.instructor)?.username || "Unknown"
        }));
    }, [data, instructors]);

    const tableColumns = [
        { key: "name_cohort", label: "Name" },
        { key: "instructor_name", label: "Instructor" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    {/* Header usually in the page, but can be here too */}
                </div>
                <Button onClick={onAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Cohort
                </Button>
            </div>

            <Table
                data={formattedData}
                columns={tableColumns}
                onEdit={onEdit}
                onAskDelete={onDelete}
                searchable={true}
            />
        </div>
    );
};
