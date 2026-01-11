import React from "react";
import { Table } from "@/components/Table";
import { Badge } from "@/components/ui/badge";

export const EnrollmentList = ({ enrollments, cohorts = [], instructors = [], onEdit, onDelete, onView }) => {

    const columns = [
        {
            key: "pathway_name",
            label: "Pathway Name",
        },
        {
            key: "cohort",
            label: "Cohort",
            // Custom render handling if cohort is an object
        },
        {
            key: "instructor",
            label: "Instructor",
            // Custom render handling if instructor is an object
        },
        {
            key: "teaching_assistants",
            label: "Teaching Assistants",
        }
    ];

    // Transform data to ensure Table renders correctly
    // If backend returns objects for cohort/instructor, we might need to map them to strings or handle custom rendering in Table
    // but Table is generic. Let's pre-process data for display.
    // The previous commented out block was removed for clarity.

    // Override renderCell logic for custom components by using the Table's flexibility. 
    // The Table component in this project seems to render based on key directly or specific logic.
    // To render the Badges for TAs, we actually need to bypass the default string conversion in Table.
    // Looking at Table.jsx, `renderCell` handles specific keys or returns `String(val)`.
    // However, lines 118 return String(val).
    // Wait, if I pass a React Element as value, `String(val)` will be `[object Object]`.
    // The Table component provided earlier (Step 23) has a `renderCell` function.
    // It checks for `_actions`, `activo`, `isDateKey`, `valores_pre_cargados`, `color`.
    // It DOES NOT seem to support arbitrary React nodes easily unless I modify Table.jsx or use on of the existing specific keys.
    // BUT, line 93 `valores_pre_cargados` renders a list of badges!
    // So if I rename my data key to `valores_pre_cargados` technically it would work but that's a hack.
    // Better approach: modifying Table.jsx is out of scope unless necessary.
    // Let's check `Table.jsx` again.
    // It returns `String(val ?? "")` at the end.
    // So I cannot pass a JSX element directly for a standard column.
    // I will instead show a comma separated string for TAs for now, as it's safer without modifying Table.jsx.
    // OR I can assume `valores_pre_cargados` behavior is reusable? No, it looks for `val?.valores`.

    const processedEnrollmentsForTable = enrollments.map(e => {
        // Resolve Cohort Name
        let cohortName = "Unknown Cohort";
        if (typeof e.cohort === 'object' && e.cohort !== null) {
            cohortName = e.cohort.name_cohort || e.cohort.name || "Unknown Cohort";
        } else {
            const foundCohort = cohorts.find(c => String(c.id) === String(e.cohort));
            if (foundCohort) cohortName = foundCohort.name_cohort;
        }

        // Resolve Instructor Name
        let instructorName = "Unknown Instructor";
        if (typeof e.instructor === 'object' && e.instructor !== null) {
            instructorName = e.instructor.name || e.instructor.username || e.instructor.email || "Unknown Instructor";
        } else {
            const foundInstructor = instructors.find(i => String(i.id) === String(e.instructor));
            if (foundInstructor) instructorName = foundInstructor.name || foundInstructor.username || foundInstructor.email;
        }

        return {
            ...e,
            cohort: cohortName,
            instructor: instructorName,
            // Flatten TAs to string for generic Table compatibility
            teaching_assistants: e.teaching_assistants?.map(ta => ta.name).join(", ") || "-"
        };
    });

    return (
        <Table
            data={processedEnrollmentsForTable}
            columns={columns}
            onEdit={(row) => {
                // ... logic ...
                const original = enrollments.find(item => item.id === row.id);
                onEdit(original);
            }}
            onAskDelete={(row) => onDelete(row.id)}
            verSeguimiento={(row) => onView(row.id)}
            searchable={true}
        />
    );
};
