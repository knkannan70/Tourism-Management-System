# Tourism Management System

A full-stack web application designed to help users explore destinations, find hotels, and book comprehensive tour packages. It includes a complete Admin Dashboard to manage inventory, handle user bookings, and monitor reviews/feedback.

## 🚀 Features

### For Users:
- **Authentication:** Secure Registration and Login with JWT authentication.
- **Explore:** Browse exotic places, top-rated hotels, and curated tour packages.
- **Booking System:** Book tour packages seamlessly and view your booking history.
- **Wishlist:** Save your favorite packages for later.
- **Reviews & Feedback:** Leave ratings and reviews for places and hotels.
- **User Profile:** Manage your personal details and track activity.

### For Administrators:
- **Dashboard:** Overview of system statistics (users, bookings, revenue).
- **Manage Inventory:** Full CRUD operations for Places, Hotels, Tour Packages, and Categories (including image gallery management).
- **Manage Users:** View, disable, enable, or delete users.
- **Manage Bookings:** Approve or reject user bookings.
- **Moderate Reviews:** Approve or delete user-submitted reviews and feedback to maintain quality.

## 🛠️ Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2.5
- Spring Security (JWT Tokens)
- Spring Data JPA (Hibernate)
- MySQL Database
- Maven

**Frontend:**
- React (Vite)
- Material-UI (MUI) for component styling
- Axios for API requests
- React Router DOM for navigation

## ⚙️ Setup Instructions

### Prerequisites
- Java Development Kit (JDK) 17+
- Node.js & npm (v18+ recommended)
- MySQL Server

### 1. Database Configuration
1. Create a MySQL database (e.g., `tourism_db`).
2. Open `backend/src/main/resources/application.properties`.
3. Update the database URL, username, and password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tourism_db
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

### 2. Running the Backend (Spring Boot)
Open a terminal in the `backend` directory and run:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend server will start on `http://localhost:8080`.

### 3. Running the Frontend (React/Vite)
Open a new terminal in the `frontend` directory and run:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will run on `http://localhost:5173`.

## 🛡️ License
This project is open-source and available under the [MIT License](LICENSE).
