import { API_URL, getHeaders } from './api';
import { finalResponse } from "../utils/responseHandler";

const endPoint = "menu";
const url = `${API_URL}/${endPoint}`;

export const postMenu = async (roleId) => {
    const headers = getHeaders()
    const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(roleId)
    })

    return await finalResponse(response, endPoint)

}
