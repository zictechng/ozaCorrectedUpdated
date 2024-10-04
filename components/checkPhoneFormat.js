// check if phone number is valid 
 
export default function IsValidPhoneNumber(data) {
    // Regular expression pattern for validating phone number
    const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;;
    //const phonePattern = phoneNumber.replace(/\D/g, '');
    return phonePattern.test(data);
};

