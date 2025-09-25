import { Module } from '@nestjs/common';
import { TotalController } from './total.controller';
import { TotalService } from './total.service';
import { PrismaModule } from '../../prisma/prisma.module'; // Giả sử bạn có module này

@Module({
  imports: [PrismaModule],
  controllers: [TotalController],
  providers: [TotalService],
})
export class TotalModule {}