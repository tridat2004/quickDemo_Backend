import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép NuxtJS trên cổng 3000
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); // Bật CORS chi tiết
  await app.listen(3001); // Backend chạy trên cổng 3001
}
bootstrap();