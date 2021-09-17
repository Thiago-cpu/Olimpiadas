export const newError = (field="default", message="error") => {
    return {
        errors: [
            {
                field,
                message
            }
        ]
    }
}