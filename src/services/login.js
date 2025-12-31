import { API_URL, getHeaders } from "./api";
import { finalResponse } from "../pages/utils/responseHandler";

const endPoint = "usuario/auth"
const url = `${API_URL}/${endPoint}`


export const postToken = async (user) => {

    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        credentials : 'include',
        body: JSON.stringify(user)
    })

    return await finalResponse(response, endPoint, 'Creation')

}




