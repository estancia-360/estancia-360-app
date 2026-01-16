import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environmentConfig, getCorsOptions, logServerStatus, MyServerConfig } from './infrastructure/config/services';
import { EnviromentEnum } from './shared/enums';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const config = environmentConfig[process.env.NODE_ENV ?? EnviromentEnum.DEVELOPMENT]
	const app = await NestFactory.create(AppModule, {
		logger: config.logger
	});
	const myServer = app.get(MyServerConfig).get();

	app.setGlobalPrefix('api/estancia-360')

	if (config.swagger) {
		const config = new DocumentBuilder()
			.setTitle('App de Estancia 360')
			.setDescription('Documentación para la app de estancia 360')
			.setVersion('1.0')
			.addBearerAuth(
				{
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
				'access-token',
			)
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/documentation', app, document);
	}

	const corsOptions = getCorsOptions(myServer.domainFrontend);
	app.enableCors(corsOptions);

	app.useGlobalPipes(new ValidationPipe({
		transform: true,
		transformOptions: {
			enableImplicitConversion: false,
		},
	}));

	await app.listen(myServer.port);
	logServerStatus(myServer);
}
bootstrap();
