# Frontend Developer Guide: Socket.IO & Real-Time Features

> Complete guide for integrating visitor tracking, notifications, and featured yachts

## 📚 Table of Contents

1. [Quick Start Guide](#-quick-start-guide)
2. [Visitor Tracking - Show Live Visitor Count](#-visitor-tracking---show-live-visitor-count)
3. [Notifications System - Real-Time User Notifications](#-notifications-system---real-time-user-notifications)
4. [Featured Yachts - Display Rotating Boats](#-featured-yachts---display-rotating-boats)
5. [Framework Integration Examples](#-framework-integration-examples)
6. [TypeScript Types & Interfaces](#-typescript-types--interfaces)
7. [Common Use Cases](#-common-use-cases)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start Guide

### What You'll Need

1. **Socket.IO Client Library**

```bash
npm install socket.io-client
# or
yarn add socket.io-client
```

2. **Server URL**

- Development: `http://localhost:5051`
- Production: Your production URL

3. **Two Types of Connections**

- **Visitor Tracking** (Public, No Auth): Path `/ws`
- **Notifications** (Requires JWT): Namespace `/api/queue`

### 5-Minute Setup

**HTML (Vanilla JS)**

```html
<!-- Include Socket.IO from CDN -->
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

<script>
  // Connect to visitor tracking
  const socket = io('http://localhost:5051', { path: '/ws' });

  // Show visitor count
  socket.on('visitors:count', (data) => {
    console.log(`${data.active} people online right now!`);
  });
</script>
```

**React/Next.js**

```tsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function App() {
  const [activeVisitors, setActiveVisitors] = useState(0);

  useEffect(() => {
    const socket = io('http://localhost:5051', { path: '/ws' });

    socket.on('visitors:count', (data) => {
      setActiveVisitors(data.active);
    });

    return () => socket.disconnect();
  }, []);

  return <div>{activeVisitors} people online</div>;
}
```

---

## 👥 Visitor Tracking - Show Live Visitor Count

### What It Does

- Tracks how many people are on your site **right now**
- Shows statistics (today's visitors, total visitors)
- No authentication required - works for all visitors
- Automatic session tracking with duration

### Step-by-Step Implementation

#### Step 1: Install Socket.IO Client

```bash
npm install socket.io-client
```

#### Step 2: Create a Visitor Tracking Hook (React)

```tsx
// hooks/useVisitorTracking.ts
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // or use react-router
import io, { Socket } from 'socket.io-client';

interface VisitorStats {
  active: number;
  todayVisitors: number;
  totalVisitors: number;
}

export function useVisitorTracking() {
  const [stats, setStats] = useState<VisitorStats>({
    active: 0,
    todayVisitors: 0,
    totalVisitors: 0,
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Connect to visitor tracking socket
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051',
      {
        path: '/ws',
      },
    );

    setSocket(newSocket);

    // Start tracking this page visit
    newSocket.emit('visit:start', { page: pathname });

    // Listen for visitor count updates
    newSocket.on('visitors:count', (data: { active: number }) => {
      setStats((prev) => ({ ...prev, active: data.active }));
    });

    // Listen for detailed stats
    newSocket.on('visitors:stats', (data: VisitorStats) => {
      setStats(data);
    });

    // Cleanup: End session when component unmounts
    return () => {
      newSocket.emit('visit:end');
      newSocket.disconnect();
    };
  }, [pathname]);

  return stats;
}
```

#### Step 3: Use It in Your Component

```tsx
// components/VisitorCounter.tsx
'use client';

import { useVisitorTracking } from '@/hooks/useVisitorTracking';

export function VisitorCounter() {
  const { active, todayVisitors, totalVisitors } = useVisitorTracking();

  return (
    <div className="flex gap-4 text-sm text-gray-600">
      <span>🟢 {active} online now</span>
      <span>📅 {todayVisitors} today</span>
      <span>📊 {totalVisitors} total</span>
    </div>
  );
}
```

#### Step 4: Add to Your Layout

```tsx
// app/layout.tsx
import { VisitorCounter } from '@/components/VisitorCounter';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>
          <VisitorCounter />
        </header>
        {children}
      </body>
    </html>
  );
}
```

### Vue 3 Composition API Example

```vue
<!-- composables/useVisitorTracking.ts -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import io, { Socket } from 'socket.io-client';

export function useVisitorTracking() {
  const active = ref(0);
  const todayVisitors = ref(0);
  const totalVisitors = ref(0);
  let socket: Socket | null = null;
  const route = useRoute();

  onMounted(() => {
    socket = io('http://localhost:5051', { path: '/ws' });

    socket.emit('visit:start', { page: route.path });

    socket.on('visitors:count', (data) => {
      active.value = data.active;
    });

    socket.on('visitors:stats', (data) => {
      active.value = data.active;
      todayVisitors.value = data.todayVisitors;
      totalVisitors.value = data.totalVisitors;
    });
  });

  onUnmounted(() => {
    if (socket) {
      socket.emit('visit:end');
      socket.disconnect();
    }
  });

  return { active, todayVisitors, totalVisitors };
}
</script>

<!-- components/VisitorCounter.vue -->
<template>
  <div class="visitor-stats">
    <span>🟢 {{ active }} online</span>
    <span>📅 {{ todayVisitors }} today</span>
    <span>📊 {{ totalVisitors }} total</span>
  </div>
</template>

<script setup lang="ts">
import { useVisitorTracking } from '@/composables/useVisitorTracking';

const { active, todayVisitors, totalVisitors } = useVisitorTracking();
</script>
```

### Available Events

| Event            | Direction       | Description                 | Data                                       |
| ---------------- | --------------- | --------------------------- | ------------------------------------------ |
| `visit:start`    | Client → Server | Start tracking a page visit | `{ page: string }`                         |
| `visit:end`      | Client → Server | End the current session     | None                                       |
| `visitors:count` | Server → Client | Current active visitors     | `{ active: number }`                       |
| `visitors:stats` | Server → Client | Detailed statistics         | `{ active, todayVisitors, totalVisitors }` |

### Analytics API Endpoint

Get detailed analytics via REST API:

```tsx
// Fetch analytics data
async function getAnalytics() {
  const response = await fetch(
    'http://localhost:5051/api/visitor/analytics/overview',
  );
  const data = await response.json();

  return {
    totalVisitors: data.totalVisitors, // { value: 5678, growth: 15.2 }
    pageViews: data.pageViews, // { value: 12345, growth: 8.5 }
    avgSessionTime: data.avgSessionTime, // { value: "2:34", seconds: 154, growth: 15 }
  };
}
```

**Example Dashboard Component:**

```tsx
'use client';

import { useEffect, useState } from 'react';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5051/api/visitor/analytics/overview')
      .then((res) => res.json())
      .then(setAnalytics);
  }, []);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card">
        <h3>Total Visitors</h3>
        <p className="text-3xl">{analytics.totalVisitors.value}</p>
        <span
          className={
            analytics.totalVisitors.growth > 0
              ? 'text-green-500'
              : 'text-red-500'
          }
        >
          {analytics.totalVisitors.growth > 0 ? '↑' : '↓'}{' '}
          {Math.abs(analytics.totalVisitors.growth)}%
        </span>
      </div>

      <div className="card">
        <h3>Page Views</h3>
        <p className="text-3xl">{analytics.pageViews.value}</p>
        <span
          className={
            analytics.pageViews.growth > 0 ? 'text-green-500' : 'text-red-500'
          }
        >
          {analytics.pageViews.growth > 0 ? '↑' : '↓'}{' '}
          {Math.abs(analytics.pageViews.growth)}%
        </span>
      </div>

      <div className="card">
        <h3>Avg Session</h3>
        <p className="text-3xl">{analytics.avgSessionTime.value}</p>
        <span
          className={
            analytics.avgSessionTime.growth > 0
              ? 'text-green-500'
              : 'text-red-500'
          }
        >
          {analytics.avgSessionTime.growth > 0 ? '↑' : '↓'}{' '}
          {Math.abs(analytics.avgSessionTime.growth)}%
        </span>
      </div>
    </div>
  );
}
```

---

## 🔔 Notifications System - Real-Time User Notifications

### What It Does

- Sends real-time notifications to logged-in users
- Requires JWT authentication
- Notifications persist in database (users get them even if offline)
- Perfect for: boat approvals, new messages, status updates

### Step-by-Step Implementation

#### Step 1: Create Notification Socket Hook (React)

```tsx
// hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface Notification {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  meta?: any;
}

export function useNotifications(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Connect to notification socket with JWT
    const newSocket = io('http://localhost:5051/api/queue', {
      auth: {
        token: token, // Your JWT token
      },
    });

    // Connection successful
    newSocket.on('success', (data) => {
      console.log('Connected as:', data.data);
      setIsConnected(true);
      setError(null);
    });

    // Connection error
    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Connection failed');
      setIsConnected(false);
    });

    // Listen for boat approval notifications
    newSocket.on('boat:approved', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      // Show toast/notification UI
      showToast(notification);
    });

    // Listen for new boat notifications
    newSocket.on('boat:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification);
    });

    // Listen for any custom notification
    newSocket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return { socket, notifications, isConnected, error };
}

function showToast(notification: Notification) {
  // Use your preferred toast library (react-hot-toast, sonner, etc.)
  alert(`${notification.title}: ${notification.message}`);
}
```

#### Step 2: Use in Your App

```tsx
// app/layout.tsx or app/dashboard/layout.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

export function NotificationProvider({ children }) {
  const { token } = useAuth(); // Get JWT from your auth system
  const { notifications, isConnected, error } = useNotifications(token);

  return (
    <>
      {children}

      {/* Connection indicator */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded">
          🟢 Connected
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded">
          ❌ {error}
        </div>
      )}

      {/* Notification list */}
      <div className="fixed top-4 right-4 space-y-2">
        {notifications.slice(0, 3).map((notif) => (
          <div
            key={notif.notificationId}
            className="bg-white shadow-lg rounded p-4 max-w-sm"
          >
            <h4 className="font-bold">{notif.title}</h4>
            <p className="text-sm text-gray-600">{notif.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

#### Step 3: Custom Event Listeners

```tsx
// You can listen for any custom event from the backend
function useCustomNotification(
  eventName: string,
  callback: (data: any) => void,
) {
  const { socket } = useNotifications(token);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
}

// Usage
function BoatListPage() {
  useCustomNotification('boat:approved', (data) => {
    console.log('A boat was approved!', data);
    // Refresh your boat list
    refetchBoats();
  });

  useCustomNotification('boat:rejected', (data) => {
    console.log('A boat was rejected', data);
  });

  return <div>Boats...</div>;
}
```

### Vue 3 Notifications Example

```vue
<!-- composables/useNotifications.ts -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import io, { Socket } from 'socket.io-client';

export function useNotifications(token: string | null) {
  const socket = ref<Socket | null>(null);
  const notifications = ref<any[]>([]);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  watch(
    () => token,
    (newToken) => {
      if (!newToken) return;

      socket.value = io('http://localhost:5051/api/queue', {
        auth: { token: newToken },
      });

      socket.value.on('success', (data) => {
        isConnected.value = true;
        error.value = null;
      });

      socket.value.on('error', (err) => {
        error.value = err.message;
        isConnected.value = false;
      });

      socket.value.on('notification', (notif) => {
        notifications.value.unshift(notif);
      });
    },
    { immediate: true },
  );

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  return { socket, notifications, isConnected, error };
}
</script>
```

### Notification Event Types

Common notification events you can listen for:

```typescript
socket.on('boat:approved', (data) => {
  /* Boat was approved */
});
socket.on('boat:rejected', (data) => {
  /* Boat was rejected */
});
socket.on('boat:new', (data) => {
  /* New boat listed */
});
socket.on('message:new', (data) => {
  /* New message received */
});
socket.on('notification', (data) => {
  /* Generic notification */
});
```

---

## ⛵ Featured Yachts - Display Rotating Boats

### What It Does

- Automatically rotates featured yachts every 7 days (configurable)
- Always returns **minimum 5 boats**
- Separate featured yachts for FLORIDA and JUPITER sites
- Simple REST API (no WebSocket needed)

### Fetch Featured Yachts

```tsx
// lib/api/yachts.ts
export async function getFeaturedYachts(site: 'FLORIDA' | 'JUPITER') {
  const response = await fetch(
    `http://localhost:5051/api/boats/featured?site=${site}`,
  );
  const data = await response.json();
  return data.data; // Array of featured yachts
}

// Type definitions
interface FeaturedYacht {
  id: string;
  boatId: string;
  site: 'FLORIDA' | 'JUPITER';
  featuredAt: string;
  expiresAt: string;
  boat: {
    id: string;
    name: string;
    year: number;
    price: number;
    images: Array<{
      file: {
        url: string;
        key: string;
      };
    }>;
    engines: Array<{
      make: string;
      model: string;
      horsepower: number;
    }>;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}
```

### React Component Example

```tsx
// components/FeaturedYachts.tsx
'use client';

import { useEffect, useState } from 'react';
import { getFeaturedYachts } from '@/lib/api/yachts';

export function FeaturedYachts({ site }: { site: 'FLORIDA' | 'JUPITER' }) {
  const [yachts, setYachts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedYachts(site)
      .then(setYachts)
      .finally(() => setLoading(false));
  }, [site]);

  if (loading) return <div>Loading featured yachts...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {yachts.map((yacht) => (
        <div
          key={yacht.id}
          className="border rounded-lg overflow-hidden shadow-lg"
        >
          <img
            src={yacht.boat.images[0]?.file?.url || '/placeholder.jpg'}
            alt={yacht.boat.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold">{yacht.boat.name}</h3>
            <p className="text-gray-600">Year: {yacht.boat.year}</p>
            <p className="text-2xl font-bold text-blue-600">
              ${yacht.boat.price.toLocaleString()}
            </p>
            <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Server Component (Next.js 13+)

```tsx
// app/featured/page.tsx
import { getFeaturedYachts } from '@/lib/api/yachts';

export default async function FeaturedPage() {
  const yachts = await getFeaturedYachts('FLORIDA');

  return (
    <div>
      <h1>Featured Yachts - Florida</h1>
      <div className="grid grid-cols-3 gap-4">
        {yachts.map((yacht) => (
          <div key={yacht.id}>
            <h3>{yacht.boat.name}</h3>
            <p>${yacht.boat.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Vue 3 Example

```vue
<template>
  <div class="featured-yachts">
    <div v-if="loading">Loading...</div>
    <div v-else class="grid">
      <div v-for="yacht in yachts" :key="yacht.id" class="yacht-card">
        <img :src="yacht.boat.images[0]?.file?.url" :alt="yacht.boat.name" />
        <h3>{{ yacht.boat.name }}</h3>
        <p>${{ yacht.boat.price.toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{ site: 'FLORIDA' | 'JUPITER' }>();
const yachts = ref([]);
const loading = ref(true);

onMounted(async () => {
  const response = await fetch(
    `http://localhost:5051/api/boats/featured?site=${props.site}`,
  );
  const data = await response.json();
  yachts.value = data.data;
  loading.value = false;
});
</script>
```

### Carousel Implementation (React)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { getFeaturedYachts } from '@/lib/api/yachts';

export function FeaturedYachtCarousel() {
  const [yachts, setYachts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getFeaturedYachts('FLORIDA').then(setYachts);
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % yachts.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + yachts.length) % yachts.length);
  };

  if (yachts.length === 0) return null;

  const yacht = yachts[currentIndex];

  return (
    <div className="relative">
      <img
        src={yacht.boat.images[0]?.file?.url}
        alt={yacht.boat.name}
        className="w-full h-96 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
        <h2 className="text-2xl font-bold">{yacht.boat.name}</h2>
        <p className="text-xl">${yacht.boat.price.toLocaleString()}</p>
      </div>
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2"
      >
        ←
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2"
      >
        →
      </button>
    </div>
  );
}
```

---

## 🎨 Framework Integration Examples

### Next.js 14 (App Router)

```tsx
// app/providers.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      path: '/ws',
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

// app/layout.tsx
import { SocketProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}

// app/page.tsx
('use client');

import { useSocket } from './providers';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const socket = useSocket();
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit('visit:start', { page: '/' });

    socket.on('visitors:count', (data) => {
      setVisitors(data.active);
    });

    return () => {
      socket.emit('visit:end');
    };
  }, [socket]);

  return <div>{visitors} people online</div>;
}
```

### Nuxt 3

```typescript
// plugins/socket.client.ts
import { io, Socket } from 'socket.io-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const socket = io(config.public.apiUrl, {
    path: '/ws',
  });

  nuxtApp.provide('socket', socket);

  nuxtApp.hook('app:unmounted', () => {
    socket.disconnect();
  });
});

// composables/useVisitors.ts
export function useVisitors() {
  const { $socket } = useNuxtApp();
  const visitors = ref(0);

  onMounted(() => {
    $socket.emit('visit:start', { page: useRoute().path });

    $socket.on('visitors:count', (data: any) => {
      visitors.value = data.active;
    });
  });

  onUnmounted(() => {
    $socket.emit('visit:end');
  });

  return { visitors };
}

// pages/index.vue
<template>
  <div>{{ visitors }} people online</div>
</template>

<script setup>
const { visitors } = useVisitors();
</script>
```

### Vanilla JavaScript (No Framework)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Yacht Tracker</title>
  </head>
  <body>
    <div id="visitor-count">Loading...</div>
    <div id="featured-yachts"></div>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
      // Visitor Tracking
      const socket = io('http://localhost:5051', { path: '/ws' });

      socket.emit('visit:start', { page: window.location.pathname });

      socket.on('visitors:count', (data) => {
        document.getElementById('visitor-count').textContent =
          `${data.active} people online`;
      });

      window.addEventListener('beforeunload', () => {
        socket.emit('visit:end');
      });

      // Featured Yachts
      fetch('http://localhost:5051/api/boats/featured?site=FLORIDA')
        .then((res) => res.json())
        .then((data) => {
          const container = document.getElementById('featured-yachts');
          data.data.forEach((yacht) => {
            const div = document.createElement('div');
            div.innerHTML = `
            <h3>${yacht.boat.name}</h3>
            <p>$${yacht.boat.price.toLocaleString()}</p>
            <img src="${yacht.boat.images[0]?.file?.url}" width="300" />
          `;
            container.appendChild(div);
          });
        });
    </script>
  </body>
</html>
```

---

## 📝 TypeScript Types & Interfaces

```typescript
// types/socket.ts

// Visitor Tracking
export interface VisitorCount {
  active: number;
}

export interface VisitorStats {
  active: number;
  todayVisitors: number;
  totalVisitors: number;
}

export interface AnalyticsOverview {
  totalVisitors: {
    value: number;
    growth: number;
  };
  pageViews: {
    value: number;
    growth: number;
  };
  avgSessionTime: {
    value: string; // "2:34" format
    seconds: number;
    growth: number;
  };
}

// Notifications
export interface Notification {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  meta?: Record<string, any>;
}

export interface NotificationSocket {
  success: (data: { data: User }) => void;
  error: (error: { message: string }) => void;
  'boat:approved': (notification: Notification) => void;
  'boat:rejected': (notification: Notification) => void;
  'boat:new': (notification: Notification) => void;
  notification: (notification: Notification) => void;
}

// Featured Yachts
export type SiteType = 'FLORIDA' | 'JUPITER';

export interface FeaturedYacht {
  id: string;
  boatId: string;
  site: SiteType;
  featuredAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  boat: Boat;
}

export interface Boat {
  id: string;
  name: string;
  year: number;
  price: number;
  description: string;
  status: 'ACTIVE' | 'PENDING' | 'SOLD';
  images: BoatImage[];
  engines: BoatEngine[];
  user: User;
}

export interface BoatImage {
  id: string;
  file: {
    id: string;
    url: string;
    key: string;
    size: number;
    mimeType: string;
  };
}

export interface BoatEngine {
  id: string;
  make: string;
  model: string;
  horsepower: number;
  year: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

---

## 💡 Common Use Cases

### Use Case 1: Homepage with Live Visitor Count

```tsx
// components/HomePage.tsx
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { FeaturedYachts } from '@/components/FeaturedYachts';

export default function HomePage() {
  const { active } = useVisitorTracking();

  return (
    <div>
      <header>
        <h1>Welcome to Yacht Trader</h1>
        <p className="text-sm text-gray-500">🟢 {active} people browsing now</p>
      </header>

      <section>
        <h2>Featured Yachts</h2>
        <FeaturedYachts site="FLORIDA" />
      </section>
    </div>
  );
}
```

### Use Case 2: Admin Dashboard with Notifications

```tsx
// app/admin/layout.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }) {
  const { token } = useAuth();
  const { notifications, isConnected } = useNotifications(token);

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 p-4">
        <h2>Admin Panel</h2>
        {isConnected ? '🟢 Connected' : '🔴 Offline'}
      </aside>

      <main className="flex-1">{children}</main>

      {/* Notification Bell */}
      <div className="fixed top-4 right-4">
        <button className="relative">
          🔔
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5">
              {notifications.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
```

### Use Case 3: Yacht Detail Page with Tracking

```tsx
// app/yachts/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useSocket } from '@/providers';

export default function YachtDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Track this specific yacht page
    socket.emit('visit:start', { page: `/yachts/${params.id}` });

    return () => {
      socket.emit('visit:end');
    };
  }, [socket, params.id]);

  return <div>Yacht Details...</div>;
}
```

### Use Case 4: Analytics Dashboard

```tsx
// components/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

export function AnalyticsDashboard() {
  const { active } = useVisitorTracking();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5051/api/visitor/analytics/overview')
      .then((res) => res.json())
      .then(setAnalytics);
  }, []);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Currently Online" value={active} icon="🟢" realTime />
      <StatCard
        title="Total Visitors"
        value={analytics.totalVisitors.value}
        growth={analytics.totalVisitors.growth}
        icon="👥"
      />
      <StatCard
        title="Page Views"
        value={analytics.pageViews.value}
        growth={analytics.pageViews.growth}
        icon="📄"
      />
      <StatCard
        title="Avg Session"
        value={analytics.avgSessionTime.value}
        growth={analytics.avgSessionTime.growth}
        icon="⏱️"
      />
    </div>
  );
}

function StatCard({ title, value, growth, icon, realTime = false }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {realTime && (
          <span className="text-xs text-green-500 animate-pulse">LIVE</span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mt-2">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {growth !== undefined && (
        <p
          className={`text-sm mt-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}
        >
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% from last month
        </p>
      )}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Problem: Socket not connecting

**Symptoms:** No visitor count updates, connection errors

**Solutions:**

```tsx
// 1. Check if Socket.IO is installed
// npm install socket.io-client

// 2. Verify the URL and path
const socket = io('http://localhost:5051', {
  path: '/ws', // Make sure path is correct
});

// 3. Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('✅ Connected!', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// 4. Check CORS (if on different domain)
// Backend should allow your frontend origin
```

### Problem: Visitor count not updating

**Symptoms:** Counter shows 0 or doesn't change

**Solutions:**

```tsx
// 1. Make sure you emit visit:start
useEffect(() => {
  socket.emit('visit:start', { page: window.location.pathname });

  // ✅ IMPORTANT: Listen AFTER emitting
  socket.on('visitors:count', (data) => {
    console.log('Received count:', data.active);
    setVisitors(data.active);
  });
}, []);

// 2. Check if event listener is set up correctly
socket.on('visitors:count', (data) => {
  console.log('Got data:', data); // Debug log
  setVisitors(data.active);
});

// 3. Ensure cleanup doesn't happen too early
return () => {
  socket.off('visitors:count'); // Remove listener
  socket.emit('visit:end'); // End session
};
```

### Problem: Notifications not working

**Symptoms:** Not receiving real-time notifications

**Solutions:**

```tsx
// 1. Verify JWT token is valid
const socket = io('http://localhost:5051/api/queue', {
  auth: {
    token: localStorage.getItem('access_token'), // Must be valid JWT
  },
});

// 2. Listen for connection status
socket.on('success', (data) => {
  console.log('✅ Authenticated:', data.data);
});

socket.on('error', (err) => {
  console.error('❌ Auth failed:', err);
  // Token might be expired or invalid
});

// 3. Check if you're listening to correct event
socket.on('boat:approved', (notif) => {
  console.log('Got notification:', notif);
});

// 4. Test with a custom event
socket.on('notification', (data) => {
  console.log('Any notification:', data);
});
```

### Problem: Featured yachts not loading

**Symptoms:** Empty list or API errors

**Solutions:**

```tsx
// 1. Check the API endpoint
const response = await fetch(
  'http://localhost:5051/api/boats/featured?site=FLORIDA',
);

if (!response.ok) {
  console.error('API Error:', response.status);
  const error = await response.text();
  console.error('Error details:', error);
}

// 2. Verify site parameter
// Must be 'FLORIDA' or 'JUPITER' (uppercase)
const site = 'FLORIDA'; // ✅ Correct
// const site = 'florida'; // ❌ Wrong

// 3. Check response structure
const data = await response.json();
console.log('Response:', data);
// Should have: { success: true, data: [...] }

// 4. Handle loading and error states
const [yachts, setYachts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('http://localhost:5051/api/boats/featured?site=FLORIDA')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then((data) => setYachts(data.data))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

### Problem: Multiple socket connections

**Symptoms:** Duplicate events, memory leaks

**Solutions:**

```tsx
// ❌ BAD: Creates new connection on every render
function MyComponent() {
  const socket = io('http://localhost:5051', { path: '/ws' });
  // ...
}

// ✅ GOOD: Use useEffect with cleanup
function MyComponent() {
  useEffect(() => {
    const socket = io('http://localhost:5051', { path: '/ws' });

    socket.on('visitors:count', handleCount);

    return () => {
      socket.off('visitors:count', handleCount);
      socket.disconnect(); // Cleanup!
    };
  }, []); // Empty deps = runs once
}

// ✅ EVEN BETTER: Use a context/provider
// See "Framework Integration Examples" section
```

### Debugging Checklist

```typescript
// Complete debugging setup
const socket = io('http://localhost:5051', {
  path: '/ws',
  transports: ['websocket', 'polling'], // Try both
});

// Log all events
socket.onAny((eventName, ...args) => {
  console.log(`📨 Event: ${eventName}`, args);
});

// Connection lifecycle
socket.on('connect', () => console.log('✅ Connected', socket.id));
socket.on('disconnect', (reason) => console.log('❌ Disconnected', reason));
socket.on('connect_error', (err) => console.error('❌ Error', err));

// Your custom events
socket.on('visitors:count', (data) => console.log('👥 Visitors:', data));
socket.on('visitors:stats', (data) => console.log('📊 Stats:', data));
```

---

## 🌐 Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:5051

# .env (Nuxt)
NUXT_PUBLIC_API_URL=http://localhost:5051

# .env (Vite/React)
VITE_API_URL=http://localhost:5051
```

**Usage:**

```typescript
// Next.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Nuxt
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

// Vite/React
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📚 Quick Reference

### Visitor Tracking Socket

```typescript
// Connect
const socket = io('http://localhost:5051', { path: '/ws' });

// Events to emit
socket.emit('visit:start', { page: '/boats/123' });
socket.emit('visit:end');

// Events to listen
socket.on('visitors:count', (data) => {
  console.log(data.active); // number
});

socket.on('visitors:stats', (data) => {
  console.log(data.active, data.todayVisitors, data.totalVisitors);
});
```

### Notification Socket

```typescript
// Connect with auth
const socket = io('http://localhost:5051/api/queue', {
  auth: { token: 'your-jwt-token' },
});

// Events to listen
socket.on('success', (data) => console.log('Authenticated'));
socket.on('error', (err) => console.error('Auth failed'));
socket.on('boat:approved', (notif) => console.log('Boat approved!'));
socket.on('notification', (notif) => console.log('Generic notification'));
```

### Featured Yachts API

```typescript
// Fetch featured yachts
const response = await fetch(
  'http://localhost:5051/api/boats/featured?site=FLORIDA',
);
const data = await response.json();
const yachts = data.data; // Array of 5+ yachts

// Fetch history
const history = await fetch(
  'http://localhost:5051/api/boats/featured/history?site=FLORIDA',
);
```

### Analytics API

```typescript
// Get analytics overview
const analytics = await fetch(
  'http://localhost:5051/api/visitor/analytics/overview',
).then((res) => res.json());

// Returns: totalVisitors, pageViews, avgSessionTime (with growth %)
```

---

## 📖 Additional Resources

- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Vue Composables](https://vuejs.org/guide/reusability/composables.html)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Questions or Issues?**

If you encounter any problems:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Verify your server is running (`npm run start:dev`)
3. Check browser console for errors
4. Review the [Quick Reference](#-quick-reference) for correct API usage

---

**Last Updated:** January 25, 2025
**Version:** 2.0 (Frontend Developer Edition)
**Maintained by:** Mirza Saikat Ahmmed
