# 💎 AURA LUXE —  E-Commerce Frontend

A demo Glassmorphic User Authentication & Account Access web application built with **React (Vite)**, **HTML5**, **CSS3 Glassmorphism**, **React Router DOM**, and **Lucide React**.

---

## ✨ Features & Visual Highlights

- **Dynamic Ambient Floating Orbs**: Smooth floating glowing ambient orbs with fluid color shifting based on active page theme:
  - **Sign Up Page**: Royal Violet (`#8b5cf6`) & Fuchsia Orchid (`#d946ef`).
  - **Login Page**: Cyberpunk Cyan (`#06b6d4`), Electric Aqua (`#0ea5e9`), and Emerald (`#10b981`).
- **Multi-Layered Frosted Glass Cards**:
  - `backdrop-filter: blur(36px)` with specular reflection edge sheens.
  - Translucent highlight borders (`rgba(255, 255, 255, 0.2)`).
  - Multi-tier ambient drop shadows.
- **Liquid Depth Inputs**:
  - Frosted background with inner depth shadows (`inset 0 2px 5px rgba(0,0,0,0.4)`).
  - Reactive theme-matched focus glow rings.
- **Vibrant Gradient Glass Buttons**:
  - Angled light-sweep shine hover animation (`::after` angled glare sweep).
- **Two Distinct Pages**:
  - **Sign Up (`/signup` & `/`)**:
    - Full Name input.
    - Identifier toggle pill (Email Address vs Phone Number).
    - Verification mode toggle pill (Password Mode vs OTP Code Mode).
    - 6-digit individual numeric input boxes with auto-advancing & backspace handling.
    - 60s live countdown timer with resend trigger.
    - Auto-redirects to `/login` with pre-filled identifier upon successful registration.
  - **Login (`/login`)**:
    - Identifier input with real-time auto-detection badge (`Detected: Email` or `Detected: Phone Number`).
    - Password & OTP authentication toggles.
    - Authenticated glassmorphic dashboard card with user metadata and **Sign Out** button.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Celebration FX**: Canvas Confetti
- **Styling**: Handcrafted CSS3 Glassmorphism & Google Fonts (*Plus Jakarta Sans* & *Outfit*)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔗 Backend Connectivity
The Vite dev server is preconfigured with proxy rules in `vite.config.js` to route `/api` calls directly to the Spring Boot backend (`http://localhost:8080`).
