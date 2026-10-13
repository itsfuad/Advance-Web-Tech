# FundRise - Crowdfunding Platform

A full-stack crowdfunding platform built with **NestJS** (backend) and **NextJS** (frontend).

## Screenshots
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-07-33" src="https://github.com/user-attachments/assets/9fefafd5-842d-46db-8c25-719be52ad8e3" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-07-40" src="https://github.com/user-attachments/assets/026884e5-2a25-4138-a23c-5e09418d6dd5" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-07-49" src="https://github.com/user-attachments/assets/f55b3e50-128b-40e3-902b-54c09ec32b6d" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-07-56" src="https://github.com/user-attachments/assets/21d9a887-bf44-42b9-ae38-daf2a610d25b" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-08-06" src="https://github.com/user-attachments/assets/7c894bad-5264-4d32-9840-7f50958ee926" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-08-15" src="https://github.com/user-attachments/assets/aed1a78e-b9ee-4f5b-9f62-8ed655c166a1" />
<img width="1920" height="972" alt="Screenshot From 2026-10-13 17-08-27" src="https://github.com/user-attachments/assets/5d46cb63-c0a4-4937-a230-c2a61780f486" />


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
# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fundrise
DB_PASSWORD=fundrise123
DB_DATABASE=fundrise

# JWT
JWT_SECRET=cat_eats_fish
JWT_EXPIRES_IN=7d

# SMTP (configure for email OTP)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=crowdfund
SMTP_PASS="..."
SMTP_FROM=noreply@itsfuad.com
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
