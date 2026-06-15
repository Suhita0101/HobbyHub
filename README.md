# HobbyHub

HobbyHub is a full-stack community app for sharing hobbies, progress updates, pictures, questions, and opinions. It adds username-only accounts, authenticated posting, image uploads, comments, voting, profiles, friend connections, private messages, category filters, and a Node/Express API.

## Features

- React + Vite frontend with a polished responsive feed, animated-feeling hero composition, category rail, search, sort, detail pages, profiles, messages, and post editor
- Account registration and login with unique usernames, hashed passwords, and JWT sessions
- Authenticated create/edit/delete for posts, with owner-only controls
- Image uploads through Multer, plus optional image URL support
- Reddit-style discussion flow with voting and comments
- User profiles with friends count, post history, and total cheers
- Friend connections and private messaging between connected users
- JSON-backed local data store for simple development and easy migration to a hosted database later

## Tech Stack

- Frontend: React, React Router, Vite, CSS
- Backend: Node.js, Express, Multer, bcryptjs, JSON Web Tokens
- Local data: `server/data/hobbyhub.json`
- Uploads: `server/uploads`

## Where User Data Goes

In the current local development version, new users, usernames, password hashes, posts, friendships, and messages are stored in:

```text
server/data/hobbyhub.json
```

Uploaded images are stored in:

```text
server/uploads
```

Passwords are not saved as plain text. The API hashes them with `bcryptjs` and stores only `passwordHash`. After sign in, the browser stores a JWT token in `localStorage` under `hobbyhub-token`.

For real deployment, move this data to a hosted database and file storage provider. The JSON file is good for local demos, but not safe for multi-server production hosting.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the API:

```bash
npm run server
```

Start the frontend in another terminal:

```bash
npm run dev
```

The API runs on `http://localhost:4300` by default. Vite proxies `/api` and `/uploads` to that backend during development.

## Production Build

```bash
npm run build
npm start
```

Before deploying, set a real JWT secret:

```bash
JWT_SECRET=your-long-random-secret
```

For a production deployment, replace the JSON data file with a hosted database such as PostgreSQL, MongoDB, or Supabase storage/database. The current structure is intentionally simple so the full-stack behavior is easy to inspect and extend.

## Project Notes

The frontend is designed to feel more like a modern hobby clubhouse: stronger first impression, richer post cards, profile surfaces, compact filters, mobile-friendly layout, and discussion-first detail pages.
