# BBS Institute — Student Registration Portal

A modern registration portal for BBS Institute of Professional Studies.
Students submit admission details and a photo via a public form, while admins manage registrations from a secure dashboard and generate printable assessment PDFs.

## Overview

This repository contains a full-stack application with:
- A static frontend built with HTML, CSS, and JavaScript
- A Node.js + Express backend for registration storage, admin authentication, and photo uploads
- Supabase as the PostgreSQL database provider
- In-browser PDF generation using `html2canvas` and `jspdf`

> Note: The current application is not using Firebase. The backend relies on Supabase and a local Node server.

## Key Features

- Responsive student registration form
- Photo upload with type validation and 2 MB file size limit
- Server-side storage of student records in Supabase
- Admin dashboard with login, list of registrations, delete support, and PDF export
- Student assessment preview and downloadable PDF
- Local photo serving via `/uploads/photos`

## Project Structure

```
frontend/
  index.html          Student registration page
  admin.html          Admin dashboard page
  pdf-preview.html    Assessment PDF preview page
  style.css           Shared styles
  script.js           Registration form workflow
  admin.js            Dashboard workflow and PDF actions
  db.js               Frontend API client for backend
  pdf-generator.js    PDF generation and assessment template
  components.js       Reusable footer markup

server/
  index.js            Express server and API routes
  package.json        Server dependencies and scripts
  db/connection.js    Supabase client configuration
  handlers/
    admin.js          Admin authentication and session support
    students.js       Registration create/read/delete handlers
  utils/
    auth.js           bearer token session utilities
    http.js           response helpers and CORS support
    upload.js         multer upload handling and photo helpers
```

## Requirements

- Node.js 18+ or compatible
- npm
- Supabase project with a PostgreSQL database
- Supabase `service_role` key for server access

## Setup

### 1. Install server dependencies

```bash
cd server
npm install
```

### 2. Create `.env`

Create a `.env` file in the `server` folder with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```


### 4. Create an admin account

Insert a dashboard login user into the `admin` table:

```sql
insert into admin (email, password)
values ('admin@example.com', 'YourSecurePassword');
```

> The app compares the password directly to the stored value, so use a strong password.

## Running Locally

From the `server` folder:

```bash
npm run start
```

The server starts on port `5000` by default.

Open in your browser:
- Student form: `http://localhost:5000/`
- Admin dashboard: `http://localhost:5000/admin.html`

## How the App Works

### Student registration flow

- Student opens `index.html`
- Fills personal, academic, and facility details
- Uploads a passport-size photo
- Form data and photo are sent to `POST /api/registrations`
- Backend inserts the record into Supabase and stores the photo locally

### Admin dashboard flow

- Admin opens `admin.html`
- Signs in using credentials stored in the `admin` table
- Dashboard fetches registrations from `GET /api/registrations`
- Admin can view, delete, or export records as PDF

### PDF generation

- `pdf-generator.js` builds a printable assessment layout
- `html2canvas` and `jspdf` render the layout into a downloadable PDF
- `pdf-preview.html` shows the assessment template before printing

## Important Notes

- Photos are stored in `server/uploads/photos`
- Admin sessions are stored in memory using a bearer token
- If the server restarts, admin sessions will expire and require re-login
- The frontend uses `sessionStorage` to persist the admin token and preview data

## API Endpoints

- `POST /api/registrations` — create a new student registration
- `GET /api/registrations` — list all registrations (admin only)
- `GET /api/registrations/:id` — get one registration (admin only)
- `DELETE /api/registrations/:id` — delete a registration (admin only)
- `POST /api/admin/login` — sign in as admin
- `POST /api/admin/logout` — sign out
- `GET /api/admin/session` — validate admin session

## Troubleshooting

- Server fails to start
  - Confirm Node version and that `.env` exists with valid Supabase values
- Data does not appear in dashboard
  - Confirm admin login credentials are correct
  - Check the `admin` and `student` tables in Supabase
- Photo upload is rejected
  - File type must be JPG, PNG, or WEBP
  - File size must be 2 MB or smaller
- PDF export does not work
  - Ensure `pdf-generator.js`, `html2canvas`, and `jspdf` are loading correctly
  - Refresh the admin dashboard and try again

## Recommended Improvements

- Hash admin passwords instead of storing plaintext
- Move photo uploads to a cloud storage provider instead of local disk
- Add pagination and search for large registration lists
- Replace in-memory sessions with persistent session storage

## Authors

- Frontend: Shivam Patel
- Backend: Aditya Patel

---

Enjoy building and extending the BBS student registration portal.
