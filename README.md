# BBS Institute — Student Registration Portal

Cloud-powered student registration. Students submit from any device; one admin dashboard shows all registrations from a central database (Firebase).

## Features

- Unlimited student registrations from anywhere
- Photos stored in Firebase Storage (not browser memory)
- Central admin dashboard for all submissions
- PDF preview and download for admin
- Secure admin login with Firebase Authentication

## Project Structure

```
frontend/
  index.html              Student registration form
  script.js               Form submit logic
  admin.html              Admin dashboard
  admin.js                Admin panel logic
  db.js                   Firebase database service
  firebase-config.js      Your Firebase keys (you must configure)
  firebase-config.example.js
  pdf-generator.js        PDF template and generator
  pdf-preview.html        Admin PDF preview
  style.css               Shared styles

firebase/
  firestore.rules         Database security rules
  storage.rules           Photo storage security rules
```

## Quick Start (Local Testing)

1. Complete **Firebase Setup** below first
2. Open terminal in `frontend` folder:
   ```bash
   python -m http.server 8000
   ```
3. Open:
   - Form: `http://localhost:8000/`
   - Admin: `http://localhost:8000/admin.html`

---

## Firebase Setup (Required)

### Step 1 — Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it e.g. `bbs-registration`
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Register a web app

1. In Firebase project → **Project settings** (gear icon)
2. Under **Your apps** → click **Web** `</>`
3. App nickname: `BBS Registration`
4. Copy the `firebaseConfig` values

### Step 3 — Configure the project

1. Open `frontend/firebase-config.js`
2. Replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. with your real values
3. Set `ADMIN_EMAIL` to the email you will use for admin login

Example:
```javascript
const FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'bbs-registration.firebaseapp.com',
  projectId: 'bbs-registration',
  storageBucket: 'bbs-registration.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
};

const ADMIN_EMAIL = 'admin@bbsips.edu.in';
```

### Step 4 — Enable Firestore Database

1. Firebase Console → **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we will add proper rules next)
4. Select a region close to India (e.g. `asia-south1` Mumbai)

### Step 5 — Enable Storage

1. Firebase Console → **Build** → **Storage**
2. Click **Get started**
3. Start in test mode → choose same region as Firestore

### Step 6 — Enable Authentication (Admin login)

1. Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. **Sign-in method** → enable **Email/Password**
4. Go to **Users** tab → **Add user**
   - Email: same as `ADMIN_EMAIL` in `firebase-config.js`
   - Password: choose your admin password (e.g. `AJAY@1234`)

### Step 7 — Deploy security rules

In Firebase Console:

**Firestore rules** (Firestore → Rules tab) — paste contents of `firebase/firestore.rules` → **Publish**

**Storage rules** (Storage → Rules tab) — paste contents of `firebase/storage.rules` → **Publish**

### Step 8 — Deploy online (so students can access from anywhere)

Host the `frontend` folder on any static hosting:

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Netlify](https://netlify.com) — drag & drop the `frontend` folder
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)

After hosting, share the public URL with students. Admin uses the same site at `/admin.html`.

---

## How It Works

| User | What happens |
|------|----------------|
| **Student** | Fills form → data + photo saved to Firebase cloud |
| **Admin** | Logs in → sees ALL students from every device |
| **PDF** | Admin downloads assessment PDF with student photo |

## Default Admin Login

- **Email** (configured in `firebase-config.js`): `admin@bbsips.edu.in`
- **Password**: the one you set in Firebase Authentication (Step 6)

Change password from the admin dashboard after logging in.

## Important Notes

- Do **not** share `firebase-config.js` publicly if it contains sensitive keys (Firebase web API keys are generally safe for client apps, but still use security rules)
- Always deploy Firestore and Storage rules before going live
- Remove **test mode** rules if you used them during setup
- Free Firebase plan supports thousands of registrations for a small institute

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Online registration is not configured" | Fill in `firebase-config.js` with real Firebase values |
| "Incorrect admin password" | Check user exists in Firebase Authentication with correct email |
| "Unable to load registrations" | Deploy Firestore rules; ensure admin is signed in |
| Photo upload fails | Deploy Storage rules; check photo is under 2 MB |
| PDF photo missing | Republish Storage rules with `allow read: if true` for photos |
