import { Module } from '@nestjs/common';
import { VisitorGateway } from './gateways/visitor.gateway';
import { VisitorService } from './services/visitor.service';
import { VisitorController } from './visitor.controller';

@Module({
  providers: [VisitorGateway, VisitorService],
  controllers: [VisitorController],
})
export class VisitorModule {}
