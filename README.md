<div align="center">
  <img src="./frontend/public/pawlio_premium_logo.png" alt="Payven Logo" width="200" />
  <h1>🐾 Payven - Enterprise Pet Care Platform</h1>
  <p>A comprehensive, real-time veterinary telemedicine and pet care management platform.</p>
</div>

---

## 📖 Overview

Payven is a full-stack, enterprise-grade SaaS application designed to bridge the gap between Pet Owners and Veterinary/Pet Care Professionals. It features a completely custom **WebRTC global telemedicine infrastructure**, an **AI-powered Health Assistant**, and a highly robust **Real-Time WebSocket** engine.

## 🛠 Tech Stack

**Frontend**
* **Framework:** React (Vite)
* **Styling:** TailwindCSS, Framer Motion (Animations)
* **State Management:** Redux Toolkit
* **Real-Time Communication:** Socket.io-client, WebRTC (RTCPeerConnection)
* **Routing:** React Router DOM

**Backend**
* **Runtime:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Real-Time Engine:** Socket.io
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **AI Integration:** Groq SDK (Llama 3 models)

---

## 👥 Role-Based Architecture (RBAC)

The platform employs a strict Role-Based Access Control system. Each role experiences a completely customized dashboard and feature set.

### 1. Pet Owner
* **Dashboard:** Unified view of active bookings, pet profiles, and upcoming consultations.
* **Service Booking:** Instantly book Vets, Groomers, Walkers, and Trainers.
* **Community:** Post images and updates to the global community feed.
* **Telemedicine:** Initiate and receive video calls and chat with Veterinarians.

### 2. Veterinarian (Professional)
* **Approval Flow:** Must be manually verified by an Admin before appearing in the marketplace.
* **Telemedicine Hub:** Manage a queue of virtual consultations.
* **Real-Time Prescriptions:** Utilize text chat and high-definition video calls with Pet Owners.
* **Finance Hub:** Track consultation revenues and completed services.

### 3. Groomer / Walker / Trainer (Service Providers)
* **Action Center:** Manage incoming bookings and service requests in real-time.
* **Status Updates:** Update booking states (Pending -> Accepted -> Completed) which instantly notify the Pet Owner.

### 4. Administrator
* **Platform God-Mode:** Full access to system statistics.
* **Verification Desk:** Manually review and approve/reject new Professional and Service Provider accounts.
* **Service Management:** Add, edit, or remove global service categories (e.g., "Premium Grooming").

---

## 🚀 Core Features & Technical Highlights

### 1. Global Telemedicine & WebRTC Architecture
Unlike standard single-page video chats, Payven's telemedicine operates globally across the entire React application via a master `CallContext`.
* **App-Wide Ringing:** Incoming WebRTC signaling alerts the user on *any* page of the application, rendering a high-priority Incoming Call Modal (`z-index: 9999`).
* **F5 / Page Reload Auto-Recovery:** A highly advanced, custom recovery protocol. If a user manually reloads the browser mid-call, the active session is serialized to `sessionStorage`. Upon mount, the app automatically re-acquires `getUserMedia()` permissions, emits a `reconnect-call-offer`, and seamlessly triggers an ICE Restart on the partner's machine without dropping the call.
* **Real-Time Presence Tracking:** WebSockets map every connected user. Users see live Green/Grey dots next to their consultation partners. Calls to offline users are strictly blocked at the UI level.
* **In-Call Hardware Controls:** Custom UI toggles for muting the microphone and pausing the camera stream by manipulating the `MediaStreamTrack.enabled` property.

### 2. AI Health Assistant (Groq Llama Integration)
* **Intelligent Triage:** A dedicated AI chat module acting as a virtual veterinary assistant.
* **High-Speed Inference:** Utilizes the Groq SDK (Llama 3 70B/8B) for near-instantaneous responses to complex pet health queries and platform navigation questions.

### 3. Real-Time WebSockets Engine
* **Instant Notifications:** Booking updates, new community comments, and Admin account approvals are pushed instantly via `socket.io` without requiring page refreshes.
* **Live Chat:** Synchronous text messaging built into the active consultation screen.

### 4. Admin Verification Pipeline
* **Account Freezing:** Service providers are locked out of the marketplace upon registration.
* **Real-Time Unlock:** Once the Admin clicks "Approve", a WebSocket event forces a state update on the Provider's client, instantly unlocking their dashboard.

### 5. Premium UI/UX (Gold & Obsidian Theme)
* Completely custom design system utilizing a "Deep Obsidian" and "Gold Silk" aesthetic.
* Heavy use of `framer-motion` for buttery smooth layout transitions, modal pop-ins, and hover states.

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB URI
* Groq API Key

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
4. Start the Vite dev server: `npm run dev`

---

## 🔒 Security
* **JWT Authentication:** Stateful token-based auth stored securely in HTTP-only cookies/local storage.
* **Browser History Manipulation:** During video calls, the `popstate` and `beforeunload` events are hijacked to prevent accidental navigation away from an active medical consultation.

---
*Built with ❤️ for Pets and the People who care for them.*