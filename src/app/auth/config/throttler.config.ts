// @Throttle() en un decorador necesita valores constantes — se evalúan al importar el
// módulo, antes de que ConfigModule/Joi terminen de inicializar, así que se leen directo
// de process.env (ya poblado por `import 'dotenv/config'`, la primera línea de main.ts)
// en vez de pasar por ThrottlerConfig. El fallback cubre el caso de no tener la variable.
export const AUTH_THROTTLE_TTL_MS = (Number(process.env.THROTTLE_TTL) || 60) * 1000;
export const AUTH_THROTTLE_LIMIT = Number(process.env.THROTTLE_AUTH_LIMIT) || 5;
