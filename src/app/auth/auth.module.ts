import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from 'src/modules/user-management/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MyJwtConfig } from 'src/infrastructure/config/services';
import { JwtStrategy } from './services/jwt.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			inject: [MyJwtConfig],
			useFactory: (jwtConfig: MyJwtConfig) => {
				const { secret, expiresIn, isActive } = jwtConfig.get();
				if (!isActive) {
					console.warn('JWT inactivo');
				}
				return {
					secret,
					signOptions: { expiresIn: Number(expiresIn) },
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
	],
})
export class AuthModule { }
