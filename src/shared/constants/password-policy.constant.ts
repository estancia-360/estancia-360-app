// 12b (auditoria QA E2E, 2026-09-03): antes solo se exigía longitud mínima de 8 caracteres
// ("12345678" era una contraseña válida) — se agrega exigencia de mayúscula, minúscula y número.
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const PASSWORD_COMPLEXITY_MESSAGE = 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número.';
