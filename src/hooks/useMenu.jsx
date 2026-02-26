import { useRef, useState } from "react";

export const useMenu = () => {
    const [menu, setMenu] = useState([]);
    const menuRef = useRef([]);

    const MenuLoad = async () => {
        const storedPermissions = localStorage.getItem("user_permissions");

        if (storedPermissions) {
            try {
                const permissions = JSON.parse(storedPermissions);

                // Views that no longer exist or are nested only — always hide
                const hiddenViews = [
                    "cohort", "enrollment", "enrollmentdetail",
                    "attendance", "attendancedetail", "followup",
                    "pricetier", "invoicelineitem", "invoicepayment"
                ];

                // Dictionary of known words to separate PascalCase
                const commonWords = [
                    "Detail", "List", "History", "Report", "User", "Profile",
                    "Settings", "Dashboard", "Company", "Role", "Log", "Board",
                    "Lead", "Request", "Item", "Tier",
                ];

                // Icon mapping — every item gets a meaningful icon
                const iconMap = {
                    "Attribute": "SlidersHorizontal",
                    "Catalogueitem": "Package",
                    "Category": "FolderTree",
                    "Client": "Building2",
                    "Contact": "UserCircle",
                    "Invoice": "Receipt",
                    "Invoicelineitem": "FileSpreadsheet",
                    "Lead": "Magnet",
                    "Payment": "CreditCard",
                    "Pipeline": "GitMerge",
                    "Pricetier": "BadgeDollarSign",
                    "Service": "Briefcase",
                    "Webhook": "Webhook",
                };

                // Display-friendly labels
                const labelMap = {
                    "Catalogueitem": "Catalogue",
                    "Contact": "Contacts",
                    "Category": "Categories",
                    "Invoice": "Invoices",
                    "Client": "Clients"
                };

                const formattedMenu = permissions
                    .filter(perm => {
                        if (!perm.startsWith("app.add_")) return false;
                        const raw = perm.replace("app.add_", "");
                        return !hiddenViews.includes(raw);
                    })
                    .map(perm => {
                        let rawName = perm.replace("app.add_", "");
                        let name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                        for (const word of commonWords) {
                            const lowerWord = word.toLowerCase();
                            if (name.toLowerCase().endsWith(lowerWord) && name.length > word.length) {
                                const prefix = name.slice(0, -word.length);
                                name = prefix + word;
                                break;
                            }
                        }

                        return {
                            title: labelMap[name] || name,
                            url: `/${name.toLowerCase()}`,
                            icon: iconMap[name] || "CircleDot",
                            items: [],
                        };
                    });

                // Grouping — meaningful buckets, no "Others" catch-all
                const crmItems = ["Lead", "Clients", "Contacts", "Service", "Pipeline"];
                const billingItems = ["Invoices", "Catalogue", "Categories"];
                const adminItems = ["Attribute", "Webhook"];

                const groups = [
                    { label: "CRM", items: formattedMenu.filter(i => crmItems.includes(i.title)) },
                    { label: "Billing", items: formattedMenu.filter(i => billingItems.includes(i.title)) },
                    { label: "Admin", items: formattedMenu.filter(i => adminItems.includes(i.title)) },
                ].filter(g => g.items.length > 0);

                menuRef.current = groups;
                setMenu(groups);
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
        menu,
        menuRef,
        MenuLoad,
    };
};