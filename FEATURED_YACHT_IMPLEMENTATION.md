# Featured Yacht Implementation - Complete ✅

## Summary

The featured yacht feature has been successfully implemented! The system will automatically rotate featured yachts every 7 days by randomly selecting from active boats.

## What Was Implemented

### 1. Database Schema ✅

- **File**: `prisma/schema/featured-yacht.prisma`
- Created `FeaturedYacht` model with:
  - `boatId`: Foreign key to Boats
  - `site`: SiteType (FLORIDA or JUPITER)
  - `featuredAt`: When yacht became featured
  - `expiresAt`: When yacht should be rotated (7 days later)
  - Unique constraint: One featured yacht per site

### 2. Cron Service ✅

- **File**: `src/lib/queue/cron/featured-yacht-cron.service.ts`
- Features:
  - Daily check at midnight (America/New_York timezone)
  - Automatically rotates expired featured yachts
  - Random selection from active boats
  - Supports both FLORIDA and JUPITER sites
  - Logs rotation events

### 3. API Service ✅

- **File**: `src/main/shared/boats/services/featured-yacht.service.ts`
- Methods:
  - `getCurrentFeaturedYacht(site)`: Get current featured yacht with full details
  - `getFeaturedYachtHistory(site?)`: Get history of featured yachts

### 4. API Controller ✅

- **File**: `src/main/shared/boats/controllers/featured-yacht.controller.ts`
- Endpoints:
  - `GET /api/boats/featured?site=FLORIDA` - Get current featured yacht
  - `GET /api/boats/featured/history?site=FLORIDA` - Get featured yacht history

### 5. DTOs ✅

- **File**: `src/main/shared/boats/dto/get-featured-yacht.dto.ts`
- DTOs for request validation

### 6. Module Registration ✅

- Updated `src/lib/queue/queue.module.ts` - Added FeaturedYachtCronService
- Updated `src/main/shared/boats/boats.module.ts` - Added FeaturedYachtService and FeaturedYachtController

## Next Steps (Required)

### 1. Generate Prisma Client

```bash
pnpm db:generate
```

### 2. Create Database Migration

```bash
pnpm db:migrate
```

### 3. Deploy Migration (Production)

```bash
pnpm db:deploy
```

## How It Works

1. **Automatic Rotation**:
   - Cron job runs daily at midnight (America/New_York)
   - Checks if current featured yacht has expired (7 days)
   - If expired, randomly selects a new active boat
   - Sets it as featured for another 7 days

2. **Random Selection**:
   - Gets all boats with status = ACTIVE
   - Excludes currently featured yacht (if exists)
   - Randomly selects one boat
   - Handles edge cases (no boats, single boat, etc.)

3. **Multi-Site Support**:
   - Each site (FLORIDA, JUPITER) has its own featured yacht
   - Rotations happen independently per site

## API Usage Examples

### Get Current Featured Yacht

```bash
GET /api/boats/featured?site=FLORIDA
```

Response includes:

- Boat details (name, price, description, etc.)
- Images (with file URLs)
- Engines
- User information
- Featured dates (featuredAt, expiresAt)

### Get Featured Yacht History

```bash
GET /api/boats/featured/history?site=FLORIDA
```

## Testing

After running migrations, you can test:

1. **Manual Rotation Test**:
   - Call the cron service method directly (via admin endpoint if needed)
   - Or wait for the daily cron job

2. **API Test**:

   ```bash
   curl http://localhost:5051/api/boats/featured?site=FLORIDA
   ```

3. **Verify Rotation**:
   - Check logs for rotation messages
   - Verify expiresAt is 7 days from featuredAt
   - Test with multiple sites

## Notes

- The cron job will automatically create the first featured yacht if none exists
- If no active boats exist, the rotation is skipped (logged as warning)
- If only one active boat exists, it can still be featured
- Featured yachts are automatically rotated after 7 days
- All rotations are logged for debugging

## Files Created/Modified

### New Files:

- `prisma/schema/featured-yacht.prisma`
- `src/lib/queue/cron/featured-yacht-cron.service.ts`
- `src/main/shared/boats/services/featured-yacht.service.ts`
- `src/main/shared/boats/controllers/featured-yacht.controller.ts`
- `src/main/shared/boats/dto/get-featured-yacht.dto.ts`

### Modified Files:

- `prisma/schema/boats.prisma` - Added FeaturedYacht relation
- `src/lib/queue/queue.module.ts` - Added FeaturedYachtCronService
- `src/main/shared/boats/boats.module.ts` - Added FeaturedYachtService and Controller

## Future Enhancements (Optional)

- Admin panel to manually select featured yacht
- Weighted random selection (prioritize newer listings)
- Analytics tracking for featured yacht views
- Multiple featured yachts simultaneously
- Custom rotation periods per site
