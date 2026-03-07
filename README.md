# Room Booking Frontend

A modern, responsive Next.js frontend application for the Room Booking System with real-time availability, JWT authentication, and seamless booking management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [API Client](#api-client)
- [Protected Routes](#protected-routes)
- [Key Features](#key-features)
- [Available Scripts](#available-scripts)

## ✨ Features

### Core Features
- **User Authentication** - Login, signup, logout with JWT tokens
- **Role-Based Access** - Separate dashboards for ADMIN and USER roles
- **Room Browsing** - View all rooms with search and filtering
- **Availability Filter** - Check room availability by date range
- **Price Range Filter** - Filter by budget, mid-range, or luxury
- **Booking Management** - Create, view, cancel bookings
- **Real-Time Validation** - Date validation and overlap prevention
- **Responsive Design** - Works on desktop, tablet, and mobile

### Advanced Features
- **Toast Notifications** - Success/error messages with auto-dismiss
- **Offline Detection** - User-friendly offline error messages
- **Retry Mechanism** - Automatic retry for failed API calls
- **Loading States** - Skeleton screens and loading indicators
- **Error Boundaries** - Graceful error handling
- **Form Validation** - Real-time validation with Zod schemas
- **Dynamic Gradients** - Unique visual styling per room
- **Confirmation Dialogs** - Explicit confirmation before booking

## 🛠 Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 18+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Authentication**: JWT (localStorage)
- **State Management**: React Context API

## 📦 Installation

```bash
cd room_booking-frontend

# Install dependencies
npm install
```

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

### Other Commands

```bash
# Lint code
npm run lint

# Run tests
npm test
```

## 📁 Project Structure

```
room_booking-frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login/signup)
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── admin/             # Admin dashboard (protected)
│   │   └── page.tsx
│   │
│   ├── book/              # Booking form page
│   │   └── page.tsx
│   │
│   ├── dashboard/         # User dashboard (protected)
│   │   └── page.tsx
│   │
│   ├── my-bookings/       # User's bookings page
│   │   └── page.tsx
│   │
│   ├── rooms/             # Browse rooms page
│   │   └── page.tsx
│   │
│   ├── favicon.ico
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # Reusable UI components
│   ├── auth-card.tsx      # Auth layout wrapper
│   ├── button.tsx         # Button component
│   ├── form-error.tsx     # Error display
│   ├── input.tsx          # Input component
│   ├── protected-route.tsx # Route protection
│   └── toast.tsx          # Toast notifications
│
├── lib/                   # Utilities and context
│   ├── api-client.ts      # Axios API client
│   ├── auth-context.tsx   # Authentication context
│   ├── schemas.ts         # Frontend validation schemas
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Helper functions
│
├── public/                # Static assets
├── types/                 # TypeScript type declarations
│   ├── cache-life.d.ts
│   └── routes.d.ts
│
├── middleware.ts          # Next.js middleware
└── package.json
```

## 🧩 Component Hierarchy

```
App (layout.tsx)
├── AuthProvider
│   └── ToastProvider
│       └── Page Content
│
Login Page
└── AuthCard
    ├── Input (email, password)
    ├── Button (submit)
    └── FormError

Rooms Page
├── Filter Section
│   ├── Date inputs (check-in/out)
│   ├── Search input
│   └── Price range dropdown
└── Rooms Grid
    └── Room Card (multiple)
        ├── Gradient header
        └── Book Now button

Booking Page
└── Booking Form
    ├── Room details
    ├── Date inputs
    ├── Price calculation
    └── Confirm button

My Bookings Page
├── Filter/Sort controls
└── Bookings List
    └── Booking Card (multiple)
        ├── Room info
        ├── Dates
        ├── Price
        ├── Status badge
        └── Cancel button
```

## 🗄️ State Management

### Authentication Context

Managed via `auth-context.tsx` using React Context:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email, password) => Promise<void>;
  signup: (email, password, name) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}
```

**Usage:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Toast Context

Managed via `toast.tsx` for notifications:

```typescript
interface ToastContextType {
  addToast: (message, type) => void;
  removeToast: (id) => void;
}
```

**Usage:**
```typescript
const { addToast } = useToast();
addToast('Booking created!', 'success');
```

### Local State

Each page manages its own state with `useState`:
- Loading states
- Form data
- Error states
- Filter/sort preferences

## 🌐 API Client

### Implementation (`lib/api-client.ts`)

The API client uses Axios with interceptors for:
- Automatic token injection
- Token refresh on 401 errors
- Retry logic for failed requests
- Offline detection
- Error standardization

### Key Features

#### 1. Automatic Token Management
```typescript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 2. Auto Refresh on Expiry
```typescript
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return client(originalRequest);
    }
    throw error;
  }
);
```

#### 3. Retry Logic
```typescript
private async requestWithRetry<T>(
  requestFn: () => Promise<T>,
  retries = 2
): Promise<T> {
  // Retries on network/server errors
  // Skips auth errors (401/403)
}
```

#### 4. Offline Detection
```typescript
if (!navigator.onLine) {
  throw new Error('No internet connection...');
}
```

### Usage Examples

```typescript
// Login
await apiClient.login(email, password);

// Get rooms
const rooms = await apiClient.getAllRooms();

// Filter available rooms
const available = await apiClient.getAvailableRooms(start, end);

// Create booking
const booking = await apiClient.createBooking({
  roomId,
  startDate,
  endDate
});

// Cancel booking
await apiClient.cancelBooking(bookingId);
```

## 🔒 Protected Routes

### Implementation (`components/protected-route.tsx`)

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : null;
}
```

### Usage in Pages

```typescript
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```typescript
// Admin pages redirect non-admins
useEffect(() => {
  if (user && user.role !== 'ADMIN') {
    router.replace('/dashboard');
  }
}, [user]);
```

## 🎯 Key Features

### 1. Room Search & Filtering

**Text Search:**
- Searches room name and hotel name
- Case-insensitive matching

**Price Range Filter:**
- Budget: <$100
- Mid-Range: $100-$200
- Luxury: >$200

**Date Availability:**
- Checks actual booking availability
- Excludes canceled bookings

### 2. Booking Confirmation

Before submission, shows:
- Room name and hotel
- Check-in/check-out dates
- Number of nights
- Total price calculation
- Requires explicit user confirmation

### 3. My Bookings Management

**Filtering:**
- All bookings
- Active only
- Canceled only

**Sorting:**
- By date (newest first)
- By price (high to low)

**Actions:**
- Cancel booking (with confirmation)
- View booking details

### 4. Toast Notifications

**Types:**
- Success (green)
- Error (red)
- Info (blue)
- Warning (yellow)

**Behavior:**
- Auto-dismiss after 5 seconds
- Manual dismiss button
- Slide-in animation
- Stacked display

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration flow
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Redirect when already logged in
- [ ] Logout and re-login
- [ ] Session persistence on refresh

#### Room Browsing
- [ ] View all rooms
- [ ] Search by room/hotel name
- [ ] Filter by price range
- [ ] Filter by date availability
- [ ] Reset filters

#### Booking Flow
- [ ] Select room and dates
- [ ] View price calculation
- [ ] Confirm booking dialog
- [ ] Successful booking creation
- [ ] Redirect to my bookings
- [ ] Overlap error handling

#### My Bookings
- [ ] View all bookings
- [ ] Filter by status
- [ ] Sort by date/price
- [ ] Cancel booking
- [ ] Empty state display

#### Error Handling
- [ ] Network error messages
- [ ] Offline detection
- [ ] API retry mechanism
- [ ] Form validation errors
- [ ] Toast notifications

## 🎨 Styling Approach

### Tailwind CSS Utility Classes

**Consistent Color Scheme:**
- Primary: Blue (blue-500, blue-600)
- Success: Green (green-500, green-600)
- Error: Red (red-500, red-600)
- Warning: Yellow (yellow-500, yellow-600)

**Responsive Design:**
```html
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Interactive States:**
```html
<button className="hover:shadow-lg transition-shadow disabled:opacity-50">
```

### Custom Animations

**Toast Slide-In:**
```css
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## 📱 Mobile Responsiveness

- Single column layout on mobile
- Touch-friendly buttons (min 44px)
- Readable font sizes (16px base)
- Proper viewport meta tag
- Responsive images and grids

## 🔧 Troubleshooting

### API Connection Issues

```bash
# Verify backend is running
curl http://localhost:5000/api

# Check NEXT_PUBLIC_API_URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

Ensure `NEXT_PUBLIC_API_URL` points to production backend.

## 📝 License

ISC
