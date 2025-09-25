import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ArticlesModule } from './articles/articles.module';
import { TotalModule } from './total/total.module';
@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // Chỉ cần Prisma, bỏ MongoModule
    ArticlesModule,
    TotalModule
  ],
})
export class AppModule {}