import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // đọc .env toàn project
    MongoModule,
  ],
})
export class AppModule {}
