# Warungku: Super Simple Point Of Sale

A lightweight and modern starter boilerplate for building point of sale (POS) applications using **Laravel** as the backend, **Inertia.js** as the server–client bridge, and **React with Shadcn UI** for a consistent and customizable user interface.  
Perfect for **retail POS**, **small businesses**, or **SaaS POS solutions**, focusing on:

- Fast setup and ease of use
- Consistent, intuitive UI
- Simple customization and expansion

## Pre Requisites

- PHP >= 8.2
- Composer
- Node.js >= 22.x
- NPM or Yarn
- A database (MySQL, PostgreSQL, SQLite, etc.)

## Tech Stack

### Backend

- **Laravel 12**

### Frontend Bridge

- **Inertia.js | React**

### UI Library

- **Shadcn UI** (React + Tailwind + Radix)

### Styling

- **Tailwind CSS**

### Build Tool

- **Vite**

### State & Data Handling

- Inertia props
- UseForm Inertia

### Authentication

_(Customize according to your setup — Breeze, Fortify, Sanctum, Passport, etc.)_

### Testing

- **PHPUnit**
- _(Optional: Jest / Vitest)_

### Included Tools & Libraries

- Database (MySQL, PostgreSQL, SQLite, etc.)
- Auth (Default)
- Laravel Excel
- DateFns
- ApexCharts
- Filepond
- Quill
- React Hot Toast
- etc...

## Todo

Current & future features for improving the app:

- [x] Offline mode (SQLite db only)
- [x] Customer management
- [x] Product resources
- [x] Mobile responsiveness
- [x] Sales reporting dashboard
- [x] Multi-store support
- [ ] Barcode scanning
- [ ] Receipt printing
- [ ] Role-based access control

## Installation

1. **Clone the repository**
    ```bash
    git clone <repo-url> && cd <project-folder>
    ```
2. **Install PHP dependencies**
    ```bash
    composer install
    ```
3. **Install Frontend dependencies**
    ```bash
    npm i
    ```
4. **Set up environment variables**
    ```bash
    cp .env.example .env
    ```
5. **Generate application key**
    ```bash
    php artisan key:generate
    ```
6. **Run Server**
    ```bash
    php artisan serve && npm run dev
    ```
