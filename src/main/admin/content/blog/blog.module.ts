import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './services/blog.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
