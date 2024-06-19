
export default function IsValidEmail(data) {
    // Regular expression pattern for validating email
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

        return emailPattern.test(data);
}
