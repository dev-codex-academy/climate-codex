import { useRef, useState } from "react";


export const useMenu = () => {

    const [menu, setMenu] = useState([]);
    const menuRef = useRef([]);

    const MenuLoad = async () => {
        // Get permissions from localStorage
        const storedPermissions = localStorage.getItem("user_permissions");

        if (storedPermissions) {
            try {
                const permissions = JSON.parse(storedPermissions);

                // Dictionary of known words to separate
                const commonWords = [
                    "Detail", "List", "History", "Report", "User", "Profile",
                    "Settings", "Dashboard", "Company", "Role", "Log", "Board", "Lead"
                ];

                // Filter and format
                const iconMap = {
                    "Attendance": "CalendarCheck",
                    "AttendanceDetail": "ListChecks",
                    "Attribute": "Tag",
                    "Client": "Building2",
                    "Cohort": "School",
                    "Enrollment": "UserPlus",
                    "EnrollmentDetail": "FileText",
                    "Followup": "MessageSquare",
                    "Lead": "Magnet",
                    "Pipeline": "GitMerge",
                    "Service": "GraduationCap",
                    "TransferRequest": "ArrowLeftRight",
                };

                const formattedMenu = permissions
                    .filter(perm => perm.startsWith("app.add_") && !perm.includes("enrollmentdetail") && !perm.includes("followup"))
                    .map(perm => {
                        // Remove the 'app.add_' prefix
                        let rawName = perm.replace("app.add_", "");

                        // Capitalize the first letter
                        let name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                        // Attempt to separate concatenated words using the dictionary
                        // e.g. "attendancedetail" -> "AttendanceDetail"
                        // Verify if the end of the string matches a common word (case insensitive check, but we append the PascalCase version)
                        for (const word of commonWords) {
                            const lowerWord = word.toLowerCase();
                            if (name.toLowerCase().endsWith(lowerWord) && name.length > word.length) {
                                // Found a match at the end
                                // "attendancedetail" ends with "detail"
                                const prefix = name.slice(0, -word.length);
                                name = prefix + word; // "Attendance" + "Detail"
                                break; // Assume only one main separation for now
                            }
                        }

                        // Return the structure expected by NavMain
                        return {
                            title: name,
                            url: `/${name.toLowerCase()}`, // Basic inferred URL
                            icon: iconMap[name] || "CircleEllipsis", // Mapped icon or default
                            items: [] // No subitems for now
                        };
                    });

                menuRef.current = formattedMenu;
                setMenu(formattedMenu);
            } catch (error) {
                console.error("Error parsing user_permissions:", error);
                menuRef.current = [];
                setMenu([]);
            }
        } else {
            menuRef.current = [];
            setMenu([]);
        }
    };

    return {
        //properties
        menu,
        menuRef,
        //methods
        MenuLoad,
    }
}