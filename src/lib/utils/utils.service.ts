import { UserResponseDto } from '@/common/dto/user-response.dto';
import { ENVEnum } from '@/common/enum/env.enum';
import { AppError } from '@/common/error/handle-error.app';
import { JWTPayload } from '@/common/jwt/jwt.interface';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilsService {
  private readonly saltRounds = 10;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  sanitizedResponse(dto: any, data: any) {
    return plainToInstance(dto, data, { excludeExtraneousValues: true });
  }

  sanitizeWithRelations<T>(
    dto: ClassConstructor<any>,
    entity: Record<string, any>,
  ): T {
    // Separate scalar fields from relations
    const scalars: Record<string, any> = {};
    const relations: Record<string, any> = {};

    for (const key in entity) {
      const value = entity[key];
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // This is either a relation object or a Prisma _count
        relations[key] = value;
      } else if (Array.isArray(value)) {
        // Relation arrays
        relations[key] = value;
      } else {
        // Scalar value
        scalars[key] = value;
      }
    }

    // Sanitize only scalars
    const sanitizedBase = this.sanitizedResponse(dto, scalars);

    // Merge sanitized scalars back with untouched relations
    return {
      ...sanitizedBase,
      ...relations,
    } as T;
  }

  removeDuplicateIds(ids: string[]) {
    return Array.from(new Set(ids));
  }

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.saltRounds);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }

  generateToken(payload: JWTPayload): string {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow(ENVEnum.JWT_SECRET),
      expiresIn: this.configService.getOrThrow(ENVEnum.JWT_EXPIRES_IN),
    });

    return token;
  }

  generateOtpAndExpiry(): { otp: number; expiryTime: Date } {
    // Use crypto for more secure randomness
    const otp = randomInt(1000, 10000); // 4-digit OTP

    // Set expiry 10 minutes from now
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    return { otp, expiryTime };
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    return this.sanitizedResponse(UserResponseDto, user);
  }

  async getUserEmailById(id: string) {
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { id },
    });

    return user.email;
  }

  async generateUsername(email: string) {
    const username = email.split('@')[0];

    // Check if username already exists
    const existingUsernameUser = await this.prisma.client.user.findUnique({
      where: { username },
    });
    if (existingUsernameUser) {
      return `${username}_${Date.now()}`;
    }

    return username;
  }

  formatFeet(feetDecimal: number) {
    const feet = Math.floor(feetDecimal);
    const inches = Math.round((feetDecimal - feet) * 12);
    return `${feet}'${inches}"`;
  }

  feetAndInchesToDecimal(feet: number, inches: number): number {
    if (feet < 0 || inches < 0 || inches >= 12) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Invalid feet/inches values');
    }
    return feet + inches / 12;
  }

  addMonthsToDate(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  safeParseJson<T>(value: any, fallback: T): T {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  async getNextListingId(): Promise<string> {
    const PREFIX = 'FYT';
    const DIGITS = 8;

    const lastBoat = await this.prisma.client.boats.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { listingId: true },
    });

    let nextNumber = 1;

    if (lastBoat?.listingId) {
      const regex = new RegExp(`^${PREFIX}(\\d{${DIGITS}})$`);
      const match = lastBoat?.listingId.match(regex);

      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `${PREFIX}${String(nextNumber).padStart(DIGITS, '0')}`;
  }
}
