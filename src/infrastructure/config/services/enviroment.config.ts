import { EnviromentEnum } from "src/shared/enums";

export const environmentConfig = {
    [EnviromentEnum.PRODUCTION]: {
        logger: ['error'],
        swagger: false,
    },
    [EnviromentEnum.DEVELOPMENT]: {
        logger: ['error', 'warn', 'log'],
        swagger: true,
    },
    [EnviromentEnum.TEST]: {
        logger: ['error'],
        swagger: true,
    },
    [EnviromentEnum.DEBUG]: {
        logger: ['error', 'warn', 'log', 'debug'],
        swagger: true,
    },
};
