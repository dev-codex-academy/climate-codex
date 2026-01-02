import { API_URL, getHeaders } from "./api";
import { finalResponse } from "../pages/utils/responseHandler";

const endPoint = "api-token-auth/"
const url = `${API_URL}/${endPoint}`


export const postToken = async (user) => {

    console.log(user);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    })


    return await finalResponse(response, endPoint, 'Creation')

}