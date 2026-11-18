# Sevi

A Library Management System — browse books by category, search the catalogue,
borrow books, and track borrowed books.

**Live site:** https://sevi-efc34.web.app/
**API:** [sevi-server](https://github.com/MdTanzil/sevi-server) — https://sevi-server.vercel.app

## Features

- Browse books by category (12 categories on the home page)
- Search books by title, author, or category — on the All Books page and from
  the home page hero search box
- Book details with rating, description, and metadata (ISBN, publisher,
  published year, language, pages)
- Add and update books through a shared form (sections: Basic Information,
  Publication Details, Cover & Stock, Description)
- Borrow books with a return date, view borrowed books, and return them
- Reading page for borrowed books
- Authentication with Firebase (email/password and Google sign-in); library
  pages are protected routes

## Tech stack

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /><img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" /><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /><img src="https://img.shields.io/badge/daisyUI-1ad1a5?style=for-the-badge&logo=daisyui&logoColor=white" /><img src="https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" /><img src="https://img.shields.io/badge/axios-671ddf?&style=for-the-badge&logo=axios&logoColor=white" /><img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />

React 18, React Router 6, Vite 4, Tailwind CSS 3, daisyUI 3, TanStack Query 5,
Axios, Firebase 10, react-hot-toast, SweetAlert2.

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in dist/
npm run lint
```

### Environment variables

No environment variables are required. The app talks to the production API
(`https://sevi-server.vercel.app/api/v1`) by default. To point it at a locally
running API server, copy `.env.example` to `.env` and set:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Firebase configuration is hardcoded in `src/config/firrebase.config.js`.

## Project structure

```
src/
├── components/   # Reusable UI: BookForm, SafeImage, Categories, Hero, NavBar, ...
├── pages/        # Route pages: Home, AllBooks, SingleBook, AddBook, UpdateBook, ...
├── hooks/        # useAuth, useAxios (API client)
├── provider/     # AuthProvider (Firebase auth context)
├── router/       # Router.jsx, PrivateRoute.jsx
├── layouts/      # MainLayout
├── config/       # Firebase config
└── utils/        # searchBooks.js (book search filter)
```

## Deployment

Pushes to `main` auto-deploy to Firebase Hosting via GitHub Actions
(`.github/workflows/deploy.yml`).

## Authors

- [@MdTanzil](https://github.com/MdTanzil)
