export const finalResponse = async (response, endPoint = 'Not define', method = 'Not define') => {

    const res = {
        data: [],
        status: 200,
        status_text: "Operation Successful",
        ok: true
    }

    try {

        if (response.ok === true) {
            const responseJson = await response.json()
            res.data = responseJson
            res.status = response.status
            res.ok = true
        } else {
            const responseJson = await response.json()
            res.data = responseJson
            res.status = response.status
            res.status_text = `Error Api: ${responseJson.message}`
            res.ok = false
        }

        return res

    } catch (err) {
        res.data = [{ endPoint, method }]
        res.status = 500
        res.status_text = `Error JS: ${err.message} \n Object: ${endPoint} \n Operation: ${method}`
        res.ok = false
        return res
    }

};