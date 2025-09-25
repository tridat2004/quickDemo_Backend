import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET /crawl_data/filter - Filter articles`);
  console.log(`   GET /crawl_data/test - Test database connection`);
  console.log(`   GET /crawl_data/categories - Get all categories`);
  console.log(`   GET /crawl_data/total - Get total number of articles`);
}
bootstrap();