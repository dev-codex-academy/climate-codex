import { postMenu } from "@/services/menu";
import { useRef, useState } from "react";


export const useMenu = () => {

    const [menu, setMenu] = useState([]);
    const menuRef = useRef([]);

    const MenuLoad = async (rolId) => {
        const menuResp = await postMenu(rolId);
        if (menuResp.ok) {
            const itemsMenu = menuResp.data;
            menuRef.current = itemsMenu;
            setMenu(itemsMenu);
        } else {
            console.error("Error loading menu:", menuResp.status_text, menuResp.data);
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