import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // CORS
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Novu API')
        .setDescription('Novu Messaging App API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT || 3000);
    console.log(`Novu is running on: http://localhost:${process.env.PORT || 3000}`);
    console.log(`Swagger Docs: http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();
