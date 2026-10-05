# Planet Careers — Planet Eco-system job portal

A job portal for the Planet group of companies. Students and employees create an
account, build or import a CV, and apply to jobs. Admins publish jobs, manage
company profiles and review applicants.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### Try it out
1. **Create an admin:** Sign up → Admin tab. Access code: `PLANET-ADMIN-2026`.
2. Sign in as admin, post a job or edit a company.
3. Sign out, **create a General account** (student or employee).
4. Build your CV in **My CV** (or import a PDF / DOCX / image).
5. Go to **Find jobs**, sort by *Best match for my CV*, and apply.
6. Sign back in as admin → **Applicants**, view the CV and change the status.
   The candidate sees the new status in **My applications**.

Sample companies and jobs are created on first run. To start over, run
`Object.keys(localStorage).filter(k => k.startsWith('planet:')).forEach(k => localStorage.removeItem(k))`
in the browser console.

## Stack
React 19, React Router 7, Vite, Tailwind CSS 4, daisyUI 5.
CV import: pdf.js (PDF), mammoth (DOCX), tesseract.js (image OCR, runs in the browser).

## Folder structure
```
src/
  services/      All data access. db.js is a fake database on localStorage.
                 authService, jobService, companyService, applicationService,
                 cvService, cvParser (file -> text -> structured CV)
  context/       AuthContext (who is signed in), ToastContext (notifications)
  hooks/         usePortalData: loads jobs, companies, CV and applications
  routes/        ProtectedRoute: keeps each panel's pages for its own users
  utils/         Pure functions: filtering/sorting, CV match score, formatting
  components/    layout (sidebar shell), ui (shared pieces), jobs, cv
  pages/         auth, general (candidate panel), admin
  data/          constants and seed data
```

## ⚠️ What this is, and what it is not
This is a **frontend-only prototype**. All data lives in the browser's
localStorage, so:
- Data is per browser. An admin's job post is visible to candidates only in the
  same browser. A real multi-user portal needs a backend and database.
- Authentication is **not secure**. Passwords are hashed (PBKDF2), but anyone
  can edit localStorage in DevTools and make themselves an admin. Real auth and
  authorization must be enforced on a server.
- The admin access code is visible in the code. Real systems create admins by
  invitation or on the server.
- `.doc` (Word 97–2003) files are not supported; save them as `.docx` or PDF.
- CV parsing is heuristic. Candidates must review imported data.
- PDF download uses the browser's print dialog ("Save as PDF").

All storage goes through `src/services/`, so the next step — an Express +
MongoDB API with JWT auth — replaces those service functions without rewriting
the UI.
