# Google Sign-In Setup Guide

Complete step-by-step guide to enable Google OAuth for the **IntelliForge AI Training Feedback Portal**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Google Cloud Project](#2-create-a-google-cloud-project)
3. [Configure OAuth Consent Screen](#3-configure-oauth-consent-screen)
4. [Create OAuth 2.0 Credentials](#4-create-oauth-20-credentials)
5. [Set Up Local Environment](#5-set-up-local-environment)
6. [Set Up Vercel Environment Variables](#6-set-up-vercel-environment-variables)
7. [Generate NEXTAUTH_SECRET](#7-generate-nextauth_secret)
8. [Test the Integration](#8-test-the-integration)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

- A Google account (any Gmail or Google Workspace account)
- Access to the Vercel project dashboard
- The app deployed at: `https://training-feedback-six.vercel.app`

---

## 2. Create a Google Cloud Project

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Sign in with your Google account
3. Click the **project dropdown** at the top-left (next to "Google Cloud")
4. Click **"New Project"** in the top-right of the modal

   | Field             | Value                              |
   |-------------------|------------------------------------|
   | Project name      | `IntelliForge Training Portal`     |
   | Organization      | (leave as default or select yours) |
   | Location          | (leave as default)                 |

5. Click **"Create"**
6. Wait for the project to be created (notification bell will confirm)
7. Make sure the new project is **selected** in the project dropdown

---

## 3. Configure OAuth Consent Screen

Before creating credentials, you must configure the consent screen (what users see when signing in).

1. In the left sidebar, navigate to:
   **APIs & Services** > **OAuth consent screen**

2. Click **"Get Started"** or **"Configure Consent Screen"**

3. Fill in the **App Information**:

   | Field                  | Value                                          |
   |------------------------|-------------------------------------------------|
   | App name               | `IntelliForge AI Training Portal`              |
   | User support email     | `gen.girish@gmail.com`                         |

4. Under **Audience**, select:
   - **External** (allows any Google account to sign in)

5. Click **"Next"**

6. Under **Contact Information**:

   | Field                       | Value                    |
   |-----------------------------|--------------------------|
   | Developer contact email(s)  | `gen.girish@gmail.com`   |

7. Click **"Next"**

8. On the **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Select these scopes:
     - `openid`
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**

9. On the **Test Users** page (if shown):
   - For testing, you can add your own email
   - Click **"Save and Continue"**

10. Review the summary and click **"Back to Dashboard"**

> **Note:** The app will be in "Testing" mode initially. While in testing mode, only test users you add can sign in. To allow anyone to sign in, you'll need to **publish the app** (see Step 3b below).

### 3b. Publishing the App (Optional — for production)

1. On the OAuth consent screen page, click **"Publish App"**
2. Google may show a warning about verification — for a simple sign-in app like this, you can proceed without verification
3. Click **"Confirm"**
4. The status changes from "Testing" to "In Production"

> Apps that only request basic scopes (`email`, `profile`, `openid`) do **not** need Google verification.

---

## 4. Create OAuth 2.0 Credentials

1. In the left sidebar, navigate to:
   **APIs & Services** > **Credentials**

2. Click **"+ Create Credentials"** at the top

3. Select **"OAuth client ID"**

4. Fill in the details:

   | Field              | Value                    |
   |--------------------|--------------------------|
   | Application type   | **Web application**      |
   | Name               | `Training Portal Web`    |

5. Under **Authorized JavaScript origins**, click **"+ Add URI"** and add:

   ```
   http://localhost:3000
   ```

   Click **"+ Add URI"** again and add:

   ```
   https://training-feedback-six.vercel.app
   ```

6. Under **Authorized redirect URIs**, click **"+ Add URI"** and add:

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   Click **"+ Add URI"** again and add:

   ```
   https://training-feedback-six.vercel.app/api/auth/callback/google
   ```

7. Click **"Create"**

8. A dialog will show your credentials:

   ```
   Client ID:     xxxxxxxxxxxxxx.apps.googleusercontent.com
   Client Secret:  GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

   **Copy both values** — you'll need them in the next steps.

> **Important:** Keep your Client Secret private. Never commit it to git or expose it in client-side code.

---

## 5. Set Up Local Environment

1. In your project root (`C:\Users\gengi\OneDrive\Desktop\training-feedback`), create a file named **`.env.local`**:

   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=xxxxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-generated-secret-here
   ```

2. Replace the placeholder values with your actual credentials from Step 4.

3. Generate a `NEXTAUTH_SECRET` value (see [Step 7](#7-generate-nextauth_secret)).

4. Restart your dev server:

   ```bash
   npm run dev
   ```

> **Note:** The `.env.local` file is already in `.gitignore` so it won't be committed to git.

---

## 6. Set Up Vercel Environment Variables

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**

2. Click on your **training-feedback** project

3. Go to **Settings** tab (top navigation)

4. Click **"Environment Variables"** in the left sidebar

5. Add each variable one by one:

   | Key                    | Value                                              | Environment     |
   |------------------------|-----------------------------------------------------|-----------------|
   | `GOOGLE_CLIENT_ID`     | `xxxxxxxxxxxxxx.apps.googleusercontent.com`          | Production, Preview, Development |
   | `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`                   | Production, Preview, Development |
   | `NEXTAUTH_URL`         | `https://training-feedback-six.vercel.app`           | Production      |
   | `NEXTAUTH_SECRET`      | (your generated secret)                              | Production, Preview, Development |

   For each variable:
   - Enter the **Key** (e.g., `GOOGLE_CLIENT_ID`)
   - Enter the **Value** (your actual credential)
   - Select the environments (check all three: Production, Preview, Development)
   - Click **"Save"**

6. After adding all four variables, **redeploy** the app:

   ```bash
   vercel --yes --prod
   ```

   Or trigger a redeploy from the Vercel dashboard: **Deployments** > click the three dots on the latest deployment > **"Redeploy"**

---

## 7. Generate NEXTAUTH_SECRET

The `NEXTAUTH_SECRET` is used to encrypt session tokens. You need a random, secure string.

### Option A: Using OpenSSL (recommended)

```bash
openssl rand -base64 32
```

This outputs something like: `K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=`

### Option B: Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option C: Using PowerShell (Windows)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### Option D: Use an online generator

Go to [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) and copy the generated string.

> Use the **same secret** for both `.env.local` (local) and Vercel environment variables (production).

---

## 8. Test the Integration

### Local Testing

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000/register`
3. Click **"Continue with Google"**
4. You should see the Google sign-in popup
5. Select your Google account
6. You should be redirected back with your name and email auto-filled
7. Visit `http://localhost:3000/dashboard` to see the Learner Dashboard

### Production Testing

1. Open `https://training-feedback-six.vercel.app/register`
2. Click **"Continue with Google"**
3. Complete the sign-in flow
4. Verify your name and email are populated
5. Check that the navbar shows your Google avatar
6. Visit `/dashboard` to access the Learner Dashboard

### What to Verify

- [ ] Google sign-in button appears on `/register`
- [ ] Clicking it opens Google's consent screen
- [ ] After sign-in, name and email are auto-filled in the registration form
- [ ] Navbar shows your Google profile picture with a dropdown menu
- [ ] The dropdown has links to My Learning, Register, Feedback, and Sign Out
- [ ] `/dashboard` shows the Learner Dashboard when signed in
- [ ] `/dashboard` shows a sign-in prompt when not authenticated
- [ ] Sign Out works correctly

---

## 9. Troubleshooting

### "Error 401: invalid_client"
- Double-check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure you copied the full values without extra spaces

### "Error 400: redirect_uri_mismatch"
- The redirect URI in Google Cloud Console must **exactly** match:
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://training-feedback-six.vercel.app/api/auth/callback/google`
- Check for typos, missing `/api/auth/callback/google`, or wrong protocol (`http` vs `https`)

### "Access blocked: This app's request is invalid" (Error 400)
- Ensure the OAuth consent screen is configured (Step 3)
- If in "Testing" mode, make sure your Google account is added as a test user

### Sign-in works locally but not on Vercel
- Verify all four environment variables are set in Vercel (Step 6)
- Make sure `NEXTAUTH_URL` is set to `https://training-feedback-six.vercel.app` (no trailing slash)
- Redeploy after adding environment variables

### Session not persisting / user keeps getting logged out
- Ensure `NEXTAUTH_SECRET` is the same across all environments
- Check that `NEXTAUTH_URL` matches the actual deployment URL

### "This app isn't verified" warning screen
- This appears for apps in "Testing" mode
- Click **"Advanced"** > **"Go to IntelliForge AI Training Portal (unsafe)"** to proceed
- To remove this: publish the app (Step 3b)

### Port 3000 already in use
- If your dev server starts on a different port (e.g., 3002), update:
  - `NEXTAUTH_URL=http://localhost:3002` in `.env.local`
  - Add `http://localhost:3002` and `http://localhost:3002/api/auth/callback/google` in Google Cloud Console

---

## Quick Reference

### Environment Variables Summary

| Variable               | Local (`.env.local`)                              | Vercel                                            |
|------------------------|---------------------------------------------------|---------------------------------------------------|
| `GOOGLE_CLIENT_ID`     | `xxxxxx.apps.googleusercontent.com`               | Same value                                        |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxx`                                   | Same value                                        |
| `NEXTAUTH_URL`         | `http://localhost:3000`                            | `https://training-feedback-six.vercel.app`        |
| `NEXTAUTH_SECRET`      | (random 32+ char string)                          | Same value as local                               |

### Google Cloud Console URLs

| Page                  | URL                                                                 |
|-----------------------|---------------------------------------------------------------------|
| Console Home          | https://console.cloud.google.com/                                   |
| OAuth Consent Screen  | https://console.cloud.google.com/apis/credentials/consent           |
| Credentials           | https://console.cloud.google.com/apis/credentials                   |

### Redirect URIs

| Environment   | URI                                                                        |
|---------------|----------------------------------------------------------------------------|
| Local         | `http://localhost:3000/api/auth/callback/google`                           |
| Production    | `https://training-feedback-six.vercel.app/api/auth/callback/google`        |

---

*This guide is for the IntelliForge AI Training Feedback Portal. For questions, contact [contact@intelliforge.tech](mailto:contact@intelliforge.tech).*
