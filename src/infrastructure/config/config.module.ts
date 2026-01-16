import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MyConfigService } from './config.service';
import { validationSchema } from './config.validation';
import { MyDataBaseConfig, MyJwtConfig, MyServerConfig } from './services';


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
    ],
    exports: [
        MyConfigService,
        MyDataBaseConfig,
        MyJwtConfig,
        MyServerConfig,
    ],
})
export class MyConfigModule { }