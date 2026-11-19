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
  Publication Details, Cover & Stock, Description) — librarians and admins
  only
- Borrow books with a return date, view borrowed books, and return them
  (max 3 books at a time); borrow history is kept on the profile page
- Wishlist: save books to a personal wishlist from the book details page
  (including out-of-stock books, whose Borrow button is disabled) and view
  them on the Wishlist page; when a wishlisted book is restocked, an
  in-app notification appears on the bell icon in the navbar (unread count,
  mark one/all read, click to open the book)
- Books can be borrowed for up to 5 days; the profile history and the
  borrowed-books page warn about due-soon (amber) and overdue (red) books
- Fully responsive design for phones, tablets, and desktops; book cards
  are clickable through to the book details page
- Public pages: About, Contact, FAQ, Terms of use, Privacy policy, Cookie
  policy, and a forgot-password page (Firebase password reset email)
- Member profiles with roles (member, librarian, admin): a virtual
  membership card, editable name/phone/address, password and email change,
  and an admin page to manage users and their roles
- Admin/librarian dashboard (`/dashboard`, linked from the navbar instead
  of Add Book): library stats (books, copies, active/overdue borrows,
  users, out-of-stock books), a searchable book list with inline stock
  editing and links to edit/add books, category image editing (thumbnail,
  URL input with live preview), all active borrows across users
  with overdue highlighting, and a shortcut to user management (admins)
- Reading page for borrowed books
- Authentication with Firebase (email/password and Google sign-in); library
  pages are protected routes. Login obtains a JWT cookie from the API, and
  logout clears both the Firebase session and that cookie.

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
├── components/   # Reusable UI: BookForm, SafeImage, Categories, Hero, NavBar, NotificationBell, WishlistCard, ...
├── pages/        # Route pages: Home, AllBooks, SingleBook, AddBook, UpdateBook, Profile, UsersAdmin, Dashboard, Wishlist, ...
├── hooks/        # useAuth, useAxios (API client), useProfile (server profile + role helpers)
├── provider/     # AuthProvider (Firebase auth context)
├── router/       # Router.jsx, PrivateRoute.jsx
├── layouts/      # MainLayout
├── config/       # Firebase config
└── utils/        # searchBooks.js (book search filter), borrowDates.js (due-date helpers)
```

## Deployment

Pushes to `main` auto-deploy to Firebase Hosting via GitHub Actions
(`.github/workflows/deploy.yml`).

## Authors

- [@MdTanzil](https://github.com/MdTanzil)
