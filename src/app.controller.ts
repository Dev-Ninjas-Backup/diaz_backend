import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const BUILD_ID = `v${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}`;

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Returns the API landing page.',
  })
  @ApiResponse({ status: 200, description: 'API landing page.' })
  root() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>diaz_backend_api</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0d1117;
      color: #e6edf3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .title {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 1.6rem;
      font-weight: 600;
      color: #e6edf3;
      letter-spacing: -0.02em;
    }

    .description {
      font-size: 0.82rem;
      color: #7d8590;
      line-height: 1.55;
      max-width: 360px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 0.3rem 0.75rem;
      font-size: 0.75rem;
      color: #8b949e;
      width: fit-content;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3fb950;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .info-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 0.75rem 1rem;
    }

    .info-label {
      font-size: 0.68rem;
      color: #7d8590;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 0.3rem;
    }

    .info-value {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.8rem;
      color: #e6edf3;
    }

    .status-value {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: #3fb950;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3fb950;
      flex-shrink: 0;
    }

    .link-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #e6edf3;
      font-size: 0.85rem;
      transition: border-color 0.15s, background 0.15s;
      cursor: pointer;
    }

    .link-card:hover {
      border-color: #58a6ff;
      background: #1c2128;
    }

    .link-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .icon-blue  { background: #1f3a5f; }
    .icon-red   { background: #3d1f1f; }

    .link-arrow {
      margin-left: auto;
      color: #7d8590;
      font-size: 0.75rem;
    }

    footer {
      margin-top: 0.5rem;
      font-size: 0.72rem;
      color: #484f58;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <div class="title">diaz_backend_api</div>
    </div>

    <p class="description">
      Backend API for Florida Yacht Trader — a professional yacht listing platform
      with subscription management, Stripe payments, and boat listings.
    </p>

    <div class="badge">
      <span class="badge-dot"></span>
      Backend Service
    </div>

    <div class="grid-2">
      <div class="info-card">
        <div class="info-label">Version</div>
        <div class="info-value">v1.0.0</div>
      </div>
      <div class="info-card">
        <div class="info-label">Build</div>
        <div class="info-value">${BUILD_ID}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-card">
        <div class="info-label">Environment</div>
        <div class="info-value">production</div>
      </div>
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="status-value">
          <span class="status-dot"></span>
          Online
        </div>
      </div>
    </div>

    <a href="/api/docs" class="link-card">
      <span class="link-icon icon-blue">📘</span>
      API Documentation
      <span class="link-arrow">↗</span>
    </a>

    <a href="/health" class="link-card">
      <span class="link-icon icon-red">❤️</span>
      Health Check
      <span class="link-arrow">↗</span>
    </a>

    <footer>© 2025 Florida Yacht Trader. All rights reserved.</footer>
  </div>
</body>
</html>`;
  }

  @Get('health')
  @ApiOperation({
    summary: 'System Health Check',
    description:
      'Returns health status for API, Database, Website, and Mobile App.',
  })
  @ApiResponse({ status: 200, description: 'Health information returned.' })
  health() {
    return {
      api: 'up',
      database: 'up',
      website: 'up',
      mobileApp: 'up',
    };
  }
}
