import { useRef, useState } from "react";


export const useMenu = () => {

    const [menu, setMenu] = useState([]);
    const menuRef = useRef([]);

    const MenuLoad = async () => {
        // Obtenemos los permisos del localStorage
        const storedPermissions = localStorage.getItem("user_permissions");

        if (storedPermissions) {
            try {
                const permissions = JSON.parse(storedPermissions);

                // Diccionario de palabras conocidas para separar
                const commonWords = [
                    "Detail", "List", "History", "Report", "User", "Profile",
                    "Settings", "Dashboard", "Company", "Role", "Log", "Board", "Lead"
                ];

                // Filtramos y formateamos
                const formattedMenu = permissions
                    .filter(perm => perm.startsWith("app.add_"))
                    .map(perm => {
                        // Quitamos el prefijo 'app.add_'
                        let rawName = perm.replace("app.add_", "");

                        // Capitalizamos la primera letra
                        let name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                        // Intentamos separar palabras pegadas usando el diccionario
                        // e.g. "attendancedetail" -> "AttendanceDetail"
                        // Verificamos si el final del string coincide con alguna palabra común (case insensitive check, but we append the PascalCase version)
                        for (const word of commonWords) {
                            const lowerWord = word.toLowerCase();
                            if (name.toLowerCase().endsWith(lowerWord) && name.length > word.length) {
                                // Encontramos una coincidencia al final
                                // "attendancedetail" ends with "detail"
                                const prefix = name.slice(0, -word.length);
                                name = prefix + word; // "Attendance" + "Detail"
                                break; // Asumimos solo una separación principal por ahora
                            }
                        }

                        // Retornamos la estructura que espera NavMain
                        return {
                            title: name,
                            url: `/${name.toLowerCase()}`, // URL inferida básica
                            icon: "SquareTerminal", // Icono por defecto
                            items: [] // Sin subitems por ahora
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