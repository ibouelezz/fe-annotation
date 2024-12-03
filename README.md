## **Project Title**

**"Task Management Platform with Firebase Integration"**

---

### **Table of Contents**

1. [Introduction](#introduction)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Usage](#usage)
6. [Project Structure](#project-structure)
7. [Assumptions Made](#assumptions-made)
8. [Future Improvements](#future-improvements)

---

### **Introduction**

This project is a task management platform built with **Next.js** and **Firebase**, allowing users to:

-   Authenticate via Firebase Authentication.
-   Manage tasks stored in Firestore.
-   Upload files to Firebase Storage.
-   Host a static Next.js app via Firebase Hosting.

---

### **Features**

-   User authentication (login and sign-up).
-   Task creation, assignment, and progress tracking.
-   File uploads (e.g., task-related images) with Firebase Storage.
-   A responsive UI built with **Tailwind CSS**.
-   Deployed and hosted on Firebase.

---

### **Prerequisites**

Ensure the following are installed on your machine:

1. [Node.js](https://nodejs.org/) (v16 or later).
2. [Firebase CLI](https://firebase.google.com/docs/cli).
3. A Firebase project set up with:
    - Authentication (Email/Password).
    - Firestore.
    - Storage.
    - Hosting.

---

### **Setup Instructions**

#### 1. **Clone the Repository**

```bash
git clone https://github.com/ibouelezz/fe-annotation.git
cd fe-annotation
```

#### 2. **Install Dependencies**

```bash
npm install
```

#### 3. **Configure Environment Variables**

Create a `.env.local` file in the project root and fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### **Usage**

-   Navigate to the deployed URL (e.g., `https://fe-annotation.vercel.app/`).
-   Sign up or log in with your email and password.
-   Create tasks, assign them, and upload images.
-   Annotate images by drawing shapes, and typing text.
-   Track progress through the responsive UI.

---

### **Project Structure**

```plaintext
src/
├── app/
│   ├── login/                  # Pages for login/signup
│   ├── tasks/                  # Pages for tasks management
│   ├── auth/                   # Firebase authentication logic
│   ├── components/             # Reusable UI components
│   ├── state/                  # Logic for state management store
├── public/                     # Static assets
├── styles/                     # Global and Tailwind CSS styles
```

---

### **Assumptions Made**

1. User can assign tasks to themselves or other users through `/tasks/assign`.
2. Files uploaded by users are scoped to their user ID for security.
3. Tasks are marked as "completed" when all annotations are finalized.

---

### **Future Improvements**

1. **Enhanced UI**:
    - Implement a good design for better look and feel.
2. **Real-Time Updates**:

    - Integrate Firestore listeners for real-time task updates.

3. **Improved Error Handling**:

    - Show detailed error messages for Firebase operations.

4. **Mobile Experience**:
    - Optimize the UI further for small-screen devices.

---

Let me know if you need help with any specific sections or further refinements!
