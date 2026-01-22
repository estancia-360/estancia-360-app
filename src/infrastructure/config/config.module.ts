import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MyConfigService } from './config.service';
import { validationSchema } from './config.validation';
import { MyDataBaseConfig, MyJwtConfig, MyServerConfig } from './services';
import { MyEmailConfig } from './services/email.config';


@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema
        }),
    ],
    providers: [
        MyConfigService,
        MyDataBaseConfig,
        MyJwtConfig,
        MyServerConfig,
        MyEmailConfig,
    ],
    exports: [
        MyConfigService,
        MyDataBaseConfig,
        MyJwtConfig,
        MyServerConfig,
        MyEmailConfig,
    ],
})
export class MyConfigModule { }