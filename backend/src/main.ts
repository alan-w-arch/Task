import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend API communications
  app.enableCors({
    origin: '*', // In production, replace with specific domain(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Social Media Scraper API')
    .setDescription('API documentation for the Social Media Scraper and NLP Dashboard')
    .setVersion('1.0.0')
    .addTag('posts')
    .addTag('analytics')
    .addTag('export')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`====================================================`);
  logger.log(`Backend service is running on: http://localhost:${port}`);
  logger.log(`Swagger API Docs available at: http://localhost:${port}/swagger`);
  logger.log(`====================================================`);
}
bootstrap();
