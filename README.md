# Umurava AI Recruitment Platform — Frontend

A modern AI-powered recruitment platform built with Next.js and Tailwind CSS.

## 🌐 Live Demo

**Frontend:** https://umurava-frontend-orpin.vercel.app  (still in development)
**Backend API:** https://umurava-backend.up.railway.app ( api running )
**Video Demo**- https://youtu.be/a5hBbV_G9gk 

## ✨ Features

- 🔐 Authentication (Email/Password + Google OAuth (optional for the Company) )
- 📧 Email verification on signup
- 👤 Applicant dashboard — browse jobs, request admin access
- 🛠️ Admin dashboard — manage jobs, candidates, screening results
- 📋 Admin request system — applicants can request admin privileges
- 📊 AI screening results visualization
- 📱 Fully responsive design

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Deployment:** Vercel ( Frontend) + Railway( For backend )

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Aubierge-codes/umurava-frontend.git
cd umurava-frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://umurava-backend.up.railway.app
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
