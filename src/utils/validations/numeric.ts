/**
 * Verifies that the provided input is a valid non-negative integer.
 * Throws structured Error messages if the data is invalid, preventing silent pipeline failures.
 * 
 * @param val - The value to parse (string, number, or null/undefined)
 * @param fieldName - The logical name of the field for coherent error logging
 * @returns parsed - The valid integer number
 */
export const validateInteger = (val: any, fieldName: string): number => {
    if (val === null || val === undefined || String(val).trim() === '') {
        throw new Error(`Doğrulama Hatası: '${fieldName}' boş bırakılamaz.`);
    }
    const parsed = Number(val);
    if (isNaN(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' numerik bir değer olmalıdır.`);
    if (!Number.isInteger(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' tam sayı (integer) olmalıdır.`);
    if (parsed < 0) throw new Error(`Doğrulama Hatası: '${fieldName}' negatif olamaz.`);
    return parsed;
};
