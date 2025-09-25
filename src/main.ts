import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,

  }); 
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ép kiểu string -> number dựa theo DTO
      whitelist: true, // bỏ query không có trong DTO
      forbidNonWhitelisted: false,
    }),
  );// Bật CORS chi tiết
  await app.listen(3001); // Backend chạy trên cổng 3001

}
bootstrap();