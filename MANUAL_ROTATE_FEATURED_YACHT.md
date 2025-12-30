# Featured Yacht Manual Rotation API

## Overview

Admin endpoint to manually trigger featured yacht rotation when the database is empty or when you need to force a rotation outside the scheduled cron job.

## Endpoint

### POST `/api/admin/boats/featured/rotate`

**Description**: Manually trigger featured yacht rotation for a specific site or all sites.

**Authorization**: Requires admin authentication (Bearer token)

**Use Cases**:

- Initialize featured yachts when database is empty
- Force rotation without waiting for daily cron job
- Update featured yacht immediately after adding new boats

## Request

### Headers

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Body (Optional)

#### Rotate specific site:

```json
{
  "site": "FLORIDA"
}
```

or

```json
{
  "site": "JUPITER"
}
```

#### Rotate all sites (if body is empty or site is omitted):

```json
{}
```

or simply send empty body

## Response

### Success Response (Specific Site)

```json
{
  "success": true,
  "message": "Featured yacht rotated successfully for FLORIDA",
  "data": {
    "site": "FLORIDA",
    "rotated": true
  }
}
```

### Success Response (All Sites)

```json
{
  "success": true,
  "message": "Featured yacht rotated successfully for all sites",
  "data": {
    "sites": ["FLORIDA", "JUPITER"],
    "rotated": true
  }
}
```

### Error Response (No Active Boats)

```json
{
  "success": false,
  "message": "Failed to manually rotate featured yacht",
  "error": "No active boats available for rotation"
}
```

## How It Works

1. **Checks Current Featured Yacht**: Verifies if a featured yacht already exists for the site
2. **Checks Expiration**: If featured yacht hasn't expired yet, it will still rotate (manual override)
3. **Selects Random Boat**: Randomly selects an active boat from the database
4. **Updates Database**: Creates or updates the featured yacht record
5. **Sets Expiration**: Sets expiration date based on `FEATURED_YACHT_ROTATION_DAYS` (default: 7 days)

## Examples

### cURL - Rotate Florida

```bash
curl -X POST http://localhost:5051/api/admin/boats/featured/rotate \
  -H "Authorization: Bearer <your_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"site": "FLORIDA"}'
```

### cURL - Rotate All Sites

```bash
curl -X POST http://localhost:5051/api/admin/boats/featured/rotate \
  -H "Authorization: Bearer <your_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### JavaScript/Fetch

```javascript
const response = await fetch(
  'http://localhost:5051/api/admin/boats/featured/rotate',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ site: 'FLORIDA' }), // or {} for all sites
  },
);

const result = await response.json();
console.log(result);
```

## Prerequisites

Before using this endpoint:

1. **Have Active Boats**: Ensure there are boats in the database with `status: 'ACTIVE'`
2. **Admin Authentication**: Must be authenticated as an admin user
3. **Environment Variables**: Check that `FEATURED_YACHT_ROTATION_DAYS` is configured (default: 7)

## Checking Results

After manual rotation, verify the featured yacht:

```bash
# Check Florida featured yacht
curl http://localhost:5051/api/boats/featured?site=FLORIDA

# Check Jupiter featured yacht
curl http://localhost:5051/api/boats/featured?site=JUPITER

# Check history (shows current featured yachts, 1-2 records max)
curl http://localhost:5051/api/boats/featured/history
```

## Common Issues

### "No active boats available"

- **Cause**: Database has no boats with `status: 'ACTIVE'`
- **Solution**: Add boats to the database or update existing boats' status to 'ACTIVE'

### Empty featured yacht history

- **Cause**: No featured yachts have been set yet (this is normal for new installations)
- **Solution**: Use this manual rotation endpoint to initialize featured yachts

### "Featured yacht already exists"

This is not an error - the manual rotation will update the existing featured yacht even if it hasn't expired yet.

## Related Endpoints

- `GET /api/boats/featured?site=FLORIDA` - Get current featured yacht
- `GET /api/boats/featured/history` - Get featured yacht history (max 2 records: 1 per site)

## Automated Rotation

The system also has automatic rotation via cron job:

- **Schedule**: Daily at midnight (configurable via `FEATURED_YACHT_CRON_SCHEDULE`)
- **Enabled by**: `FEATURED_YACHT_CRON_ENABLED=true`
- **Documentation**: See `FEATURED_YACHT_CRON.md`
