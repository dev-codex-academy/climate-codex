export const handleSaveCrud = async (object, apiCall, getData, setNotification, setIsModalOpen) => {

    try {
        const response = await apiCall(object);
        const success = response.ok
        if (success) await getData()
        setNotification({
            message: success ? 'Operation Successful' : 
                                `Error saving changes ${response.status_text}`,
            type: success ? 'success' : 'error',
        })
    } catch (err) {
        setNotification({ message: 'Error saving changes', type: 'error' });
    } finally {
        setIsModalOpen(false);
    }

}