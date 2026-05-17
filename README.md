### E-Commerce Platform (Draken)

A modern, full-featured e-commerce storefront built with React. Features product browsing, cart management, user authentication, profile, and seamless checkout flow with a backend API (MongoDB).

Live demo-style experience with realistic UI, dark mode, responsive design, and order processing.

## ✨ Features

- **Product Catalog**: Browse, search, and filter products by category
- **Shopping Cart**: Add/remove items, quantity management, persistent via localStorage
- **Authentication**: Login/Signup with JWT token handling
- **User Profile**: View orders and account details
- **Checkout Flow**: Realistic shipping + payment simulation
- **Responsive Design**: Mobile-first with Tailwind CSS + Bootstrap
- **Dark Mode**: Toggle between light and dark themes
- **Notifications**: Toast-style success/error messages
- **Backend Integration**: Axios calls to `/api/shop/*` endpoints (MongoDB backend)

## 🛠 Tech Stack

**Frontend:**
- **React 18** (Create React App)
- **React Router DOM** v6
- **Tailwind CSS** + PostCSS + Autoprefixer
- **Bootstrap 5** + React Bootstrap
- **Axios** for API calls
- **Font Awesome** (icons)

**Backend (Separate / Assumed):**
- Node.js / Express (running on `http://localhost:5000`)
- **MongoDB** (Mongoose for users, products, orders)

**Other:**
- Proxy configured in `package.json` for seamless frontend-backend development
- Unsplash for product images

## 📁 Project Structure

```bash
E-commerce/
├── public/
│   ├── bootstrap.min.css
│   ├── default-avatar.png/svg
│   ├── favicon.ico
│   ├── index.html
│   ├── logo*.png
│   └── manifest.json
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login.jsx
│   │   │   └── singup.jsx (note: typo in filename)
│   │   ├── header.jsx
│   │   ├── loader.jsx
│   │   └── message.jsx
│   │
│   ├── pages/
│   │   └── profile.jsx
│   │
│   ├── App.js                 # Main app with Storefront component
│   ├── index.js
│   ├── index.css
│   └── ... (standard CRA files)
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/asardev7/E-commerce.git
cd E-commerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Backend Setup (Required)
This frontend expects a backend running at `http://localhost:5000`.

- Ensure your backend (Node.js + Express + MongoDB) is running
- It should expose endpoints like:
  - `GET /api/shop/products`
  - `POST /api/shop/orders`
  - Authentication routes

(If you have the backend repo, clone and run it separately.)

### 4. Environment / Configuration
- No `.env` needed for basic frontend (proxy is already set)
- Update `proxy` in `package.json` if your backend port differs

### 5. Run the Application
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📝 Available Scripts

- `npm start` — Runs the app in development mode
- `npm run build` — Builds the app for production
- `npm test` — Launches the test runner

## 🔑 Key Notes

- Cart persists in `localStorage`
- User info stored in `localStorage` after login
- Products and categories loaded from backend on mount
- Checkout requires authentication
- MongoDB is used on the backend for data persistence

## 🛠 Future Improvements

- Add Redux/Context for better state management
- Implement real payment integration (Stripe)
- Product reviews & ratings
- Wishlist
- Admin dashboard
- Deployment (Vercel/Netlify + Render/Heroku for backend)

---

**Made by Asar**

Feel free to star the repo if you find it useful! Contributions welcome.
