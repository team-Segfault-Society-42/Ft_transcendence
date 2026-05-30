import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * @description Parses CORS origins from the CORS_ORIGINS environment variable.
 * @returns List of allowed origins.
 */
function getAllowedOrigins(): string[] {
	const rawOrigins = process.env.CORS_ORIGINS ?? '';

	return rawOrigins
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin !== '');
}

/**
 * @description Bootstraps the NestJS backend application.
 * @returns Nothing.
 * @remarks Configures CORS, cookie parsing, validation, and Swagger documentation.
 */
async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: getAllowedOrigins(),
		credentials: true,
	});

	app.use(cookieParser());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	if (process.env.NODE_ENV !== 'production') {
		const config = new DocumentBuilder()
			.setTitle('ft_transcendence API')
			.setDescription('API documentation for ft_transcendence backend')
			.setVersion('1.0')
			.addServer('/api')
			.build();

		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api-docs', app, document);
	}
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
