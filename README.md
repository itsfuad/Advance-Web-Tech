# FundRise - Crowdfunding Platform

A full-stack crowdfunding platform built with **NestJS** (backend) and **NextJS** (frontend).

## Features

### User Roles
- **Guest** – Browse campaigns without logging in
- **User** – Register, create campaigns, donate to other campaigns
- **Admin** – Manage all campaigns and users

### User Features
- 📧 Account creation via email
- 🔐 Email OTP-based password reset (via SMTP/Nodemailer)
- 👤 Profile management (name, profile image)
- 🔒 Change password
- 📢 Create, edit, and delete campaigns
- 💰 Donate to campaigns (mock payment system)
- 🚩 Report campaigns
- 📊 Personal statistics dashboard

### Admin Features
- ❄️ Freeze/unfreeze campaigns
- 🚫 Block/ban user accounts
- 📊 Platform-wide statistics
- 👁️ View reported campaigns

### Campaign Features
- Browse with search & category filters
- Pagination
- Cover image upload
- Goal amount & deadline
- Real-time donation progress

### Payment System
- Mock payment system simulating a real payment gateway
- Card number validation
- Transaction IDs
- 95% success rate simulation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS + TypeORM + SQLite |
| Frontend | NextJS 16 + App Router |
| Auth | JWT + bcrypt |
| Email | Nodemailer (SMTP) |
| UI | Custom shadcn-style components |
| Styling | Tailwind CSS (Black & White) |

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Configure SMTP settings in .env
npm install
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Update NEXT_PUBLIC_API_URL if needed
npm install
npm run build
npm start
```

### Default Admin Account

After starting the backend, an admin can be created by:
1. Register normally at `/register`
2. Update the role in the database directly

Or use the seed script:
```bash
cd backend && node dist/seed.js
# Admin: admin@fundrise.com / Admin@123456
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Send OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |
| GET | `/api/campaigns` | List campaigns (public) |
| POST | `/api/campaigns` | Create campaign |
| PATCH | `/api/campaigns/:id` | Update campaign |
| DELETE | `/api/campaigns/:id` | Delete campaign |
| POST | `/api/campaigns/:id/report` | Report campaign |
| PATCH | `/api/campaigns/:id/freeze` | Freeze (admin) |
| PATCH | `/api/campaigns/:id/unfreeze` | Unfreeze (admin) |
| POST | `/api/donations/campaign/:id` | Donate |
| GET | `/api/stats/me` | User stats |
| GET | `/api/stats/platform` | Platform stats (admin) |

## Environment Variables

### Backend (.env)
```
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=fundrise.db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@fundrise.com
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
