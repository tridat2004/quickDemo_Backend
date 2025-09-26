import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { TotalModule } from './total/total.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // Chỉ cần Prisma, bỏ MongoModule
    ArticlesModule,
    TotalModule,
     MongooseModule.forRoot(process.env.DATABASE_URL!),
  ],
})
export class AppModule {}