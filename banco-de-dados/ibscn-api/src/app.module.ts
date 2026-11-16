import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataController } from './data.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AppController, DataController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
