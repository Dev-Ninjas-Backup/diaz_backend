import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private makeSharedLink(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateBlogDto, file?: Express.Multer.File) {
    let fileRecord = null;

    if (file) {
      const uploaded = await this.s3.uploadFiles([file]);
      fileRecord = uploaded.data.files[0];
    }

    const sharedLink = this.makeSharedLink(dto.blogTitle);

    const existing = await this.prisma.client.blog.findFirst({
      where: { sharedLink },
    });

    if (existing) {
      throw new ConflictException(
        'Blog with the same shared link already exists',
      );
    }

    return this.prisma.client.blog.create({
      data: {
        blogTitle: dto.blogTitle,
        blogDescription: dto.blogDescription,
        postStatus: dto.postStatus,
        sharedLink: sharedLink,
        blogImageId: fileRecord?.id,
      },
      include: { blogImage: true },
    });
  }

  async findAll() {
    return this.prisma.client.blog.findMany({
      include: { blogImage: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const blog = await this.prisma.client.blog.findUnique({
      where: { id },
      include: { blogImage: true },
    });

    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto, file?: Express.Multer.File) {
    await this.findOne(id);

    let fileRecord = null;

    if (file) {
      const uploaded = await this.s3.uploadFiles([file]);
      fileRecord = uploaded.data.files[0];
    }

    const sharedLink = dto.blogTitle
      ? this.makeSharedLink(dto.blogTitle)
      : undefined;

    const { blogTitle, blogDescription, postStatus } = dto;
    return this.prisma.client.blog.update({
      where: { id },
      data: {
        blogTitle,
        blogDescription,
        postStatus,
        sharedLink,
        blogImageId: fileRecord?.id,
      },
      include: { blogImage: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.blog.delete({
      where: { id },
    });
  }

  async findBySharedLink(sharedLink: string) {
    const blog = await this.prisma.client.blog.findFirst({
      where: { sharedLink },
      include: { blogImage: true },
    });

    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }
}
