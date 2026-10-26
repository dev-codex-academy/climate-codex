import { useRef, useState } from "react";

export const useMenu = () => {
    const [menu, setMenu] = useState([]);
    const menuRef = useRef([]);

    const MenuLoad = async () => {
        const storedPermissions = localStorage.getItem("user_permissions");

        if (storedPermissions) {
            try {
                // The menu shows ONLY what the user's real permissions allow. (It used to
                // inject add_inventory/add_asset/add_assetassignment/add_catalogueitem for
                // everybody, so users with no role saw Inventory, Catalogue and Assets links
                // that only led to 403 pages.)
                const permissions = JSON.parse(storedPermissions);

                // Views that no longer exist or are nested only — always hide
                const hiddenViews = [
                    "enrollment", "enrollmentdetail",
                    "attendance", "attendancedetail", "followup",
                    "pricetier", "invoicelineitem", "invoicepayment",
                    "aiconversation", "aimessage",
                    // Mentorship models: managed from the Cohort detail / mentor self-service pages
                    "cohortmentor", "mentorprofile", "availabilityrule", "mentorshipbooking",
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
                    "Inventory": "Warehouse",
                    "Asset": "Laptop",
                    "Assetassignment": "ClipboardList",
                    "Webhook": "Webhook",
                    "Cohort": "GraduationCap",
                };

                // Display-friendly labels
                const labelMap = {
                    "CatalogueItem": "Catalogue",
                    "Catalogueitem": "Catalogue",
                    "Contact": "Contacts",
                    "Category": "Categories",
                    "Invoice": "Invoices",
                    "Client": "Clients",
                    "Asset": "Assets",
                    "Assetassignment": "Asset Assignments",
                    "Cohort": "Cohorts",
                    "Lead": "Leads",
                    "Service": "Services",
                    "Pipeline": "Pipelines",
                };

                const formattedMenu = permissions
                    .filter(perm => {
                        if (!perm.startsWith("app.add_")) return false;
                        const raw = perm.replace("app.add_", "").replace("_", "");
                        return !hiddenViews.includes(raw);
                    })
                    .map(perm => {
                        let rawName = perm.replace("app.add_", "").replace("_", "");
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
                            url: name === 'CatalogueItem' || name === 'Catalogueitem' ? '/catalogue' : `/${name.toLowerCase()}`,
                            icon: iconMap[name] || "CircleDot",
                            items: [],
                        };
                    });

                // Inject Pipeline Attributes if pipeline permission exists
                if (permissions.includes("app.add_pipeline")) {
                    formattedMenu.push({
                        title: "Lead Fields",
                        url: "/attribute-pipeline",
                        icon: "SlidersHorizontal",
                        items: [],
                    });
                }

                // Inject Chett AI if the user has view access to AI conversations.
                // Not derived from the add_* auto-mapping above (that would generate
                // an "Aiconversation" entry pointing at /aiconversation), so it's
                // hidden via hiddenViews and added here with the right label/url/icon.
                if (permissions.includes("app.view_aiconversation")) {
                    formattedMenu.push({
                        title: "Chett AI",
                        url: "/chett-ai",
                        icon: "Bot",
                        items: [],
                    });
                }

                // Mentor self-service (teachers / Teacher Assistants). Gated by
                // view_mentorprofile, which setup_mentor_groups grants to both groups.
                if (permissions.includes("app.view_mentorprofile")) {
                    // Teachers / TAs get a read-only list of THEIR cohorts (the API filters it); anyone who
                    // manages cohorts already has the regular "Cohorts" entry.
                    if (permissions.includes("app.view_cohort") && !permissions.includes("app.add_cohort")) {
                        formattedMenu.push({ title: "My Cohorts", url: "/cohort", icon: "GraduationCap", items: [] });
                    }
                    // The API only serves these two screens to members of the teachers / Teacher Assistant
                    // groups (it checks the group NAME, not a permission). A superuser has view_mentorprofile
                    // automatically but isn't a mentor, so the permission alone would show a link that only
                    // ends in "Only teachers and teaching assistants can use this."
                    let groupNames = [];
                    try {
                        groupNames = JSON.parse(localStorage.getItem("user_data") || "{}").groups || [];
                    } catch {
                        groupNames = [];
                    }
                    if (groupNames.includes("teachers") || groupNames.includes("Teacher Assistant")) {
                        formattedMenu.push(
                            { title: "My Availability", url: "/my-availability", icon: "Calendar", items: [] },
                            { title: "My Mentorships", url: "/my-mentorships", icon: "CalendarCheck", items: [] },
                        );
                    }
                }

                // Managers (superusers, and anyone who can change cohorts: owner, operations) see what every
                // teacher / TA configured. Same rule the API uses (can_manage_cohorts).
                if (permissions.includes("app.change_cohort")) {
                    formattedMenu.push({ title: "Mentor Availability", url: "/mentor-overview", icon: "CalendarRange", items: [] });
                }

                // Inject Lead Reassignment for superusers only — bulk operation
                // gated by is_superuser (see PermissionGuard's requireSuperuser),
                // not a regular Django permission, so it isn't in `permissions`.
                let isSuperuser = false;
                try {
                    const storedUser = localStorage.getItem("user_data");
                    isSuperuser = storedUser ? JSON.parse(storedUser).is_superuser : false;
                } catch {
                    isSuperuser = false;
                }
                if (isSuperuser) {
                    formattedMenu.push({
                        title: "Lead Reassignment",
                        url: "/lead-reassignment",
                        icon: "Users",
                        items: [],
                    });
                }

                // Grouping — meaningful buckets, no "Others" catch-all
                // Order matters: this is the order of the CRM sections in the top bar.
                const crmItems = ["Leads", "Services", "Cohorts", "Pipelines", "Clients", "Contacts"];
                const billingItems = ["Invoices", "Catalogue", "Categories", "Inventory"];
                const assetItems = ["Assets", "Asset Assignments"];
                const aiItems = ["Chett AI"];
                const mentoringItems = ["My Cohorts", "My Availability", "My Mentorships", "Mentor Availability"];
                const adminItems = ["Attribute", "Lead Fields", "Webhook", "Lead Reassignment"];

                const groups = [
                    { label: "CRM", items: crmItems.map(t => formattedMenu.find(i => i.title === t)).filter(Boolean) },
                    { label: "Billing / Inventory", items: formattedMenu.filter(i => billingItems.includes(i.title)) },
                    { label: "Assets", items: formattedMenu.filter(i => assetItems.includes(i.title)) },
                    { label: "Mentoring", items: formattedMenu.filter(i => mentoringItems.includes(i.title)) },
                    { label: "AI", items: formattedMenu.filter(i => aiItems.includes(i.title)) },
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