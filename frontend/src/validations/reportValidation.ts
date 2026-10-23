export const validateDamageReport = (lat: number, lng: number) => (!lat || !lng ? 'GPS required' : null);
