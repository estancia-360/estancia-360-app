export const generateCode = (n: number): number => {
    const max = Math.pow(10, n) - 1;
    const min = Math.pow(10, n - 1);
    return Math.floor(min + Math.random() * (max - min + 1));
};