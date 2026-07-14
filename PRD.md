# WANDR - Product Requirements Document (PRD)

## 1. Product Overview
WANDR is an AI-powered travel planning application designed to simplify the process of organizing trips, managing budgets, and collaborating with friends. By leveraging Large Language Models (LLMs) and real-time APIs, WANDR acts as a smart co-pilot that generates comprehensive itineraries, tracks shared expenses, and stores essential travel documents in one unified platform.

## 2. Target Audience
- **Frequent Travelers & Vacationers:** Looking for curated experiences without hours of manual research.
- **Group Travelers:** Friends or families planning shared trips who need a centralized hub.
- **Budget-Conscious Explorers:** Users who need to meticulously track and split shared expenses.
- **Digital Nomads:** Individuals requiring a reliable tool to manage logistics, bookings, and files on the go.

## 3. Core Features

### 3.1 AI Itinerary Generation
- **Smart Planning:** Users input their destination, dates, budget, and travel preferences.
- **Agentic Architecture:** The backend orchestrates multiple specialized AI agents (Itinerary, Budget, Flights, Hotels) using Google Gemini to construct a cohesive travel plan.
- **Detailed Schedules:** Generates day-by-day itineraries including activities, dining options, and estimated travel times.

### 3.2 Trip Management Dashboard
- **Centralized Hub:** A "My Trips" dashboard to view all active, past, and archived trips.
- **State Management:** Users can archive old trips to declutter their workspace or permanently delete them.

### 3.3 Collaborative Planning
- **Invite System:** Trip owners can invite buddies via email to collaborate on a trip.
- **Role-Based Access:** Secures data so only authorized trip members (Owners/Admins) can view or modify the itinerary and budget.

### 3.4 Budget & Expense Splitting
- **Cost Tracking:** Users can log expenses, specifying the payer, amount, and category.
- **Dynamic Splitting:** Automatically calculates splits among participants (integrating directly with officially invited trip members).
- **Settlements Engine:** Calculates optimized debt settlements, displaying exactly who owes whom to balance the books.

### 3.5 Logistics & File Management
- **File Manager:** Users can upload, view, and delete travel documents (flight tickets, hotel bookings, PDFs, images) directly within the trip workspace.
- **Cloud Storage:** Securely powered by Cloudflare R2 (S3-compatible storage) ensuring files are persistent and rapidly accessible.

### 3.6 Interactive Maps & Routing
- **Visualization:** Integrated mapping (via Ola Maps / OpenStreetMap) to visualize daily routes and pin locations of interest.

## 4. Technical Architecture

### 4.1 Frontend (Client)
- **Framework:** Next.js (React) using the App Router.
- **Styling:** Tailwind CSS (designed with a modern, premium, glass-morphism aesthetic).
- **Language:** TypeScript for type safety.
- **Authentication:** Clerk for seamless user identity management.
- **Deployment:** Vercel.

### 4.2 Backend (API)
- **Framework:** FastAPI (Python) for high-performance, asynchronous endpoints.
- **Database:** PostgreSQL (hosted on Neon) with SQLAlchemy (Async ORM).
- **AI Integration:** Google Gemini integrated via custom Python orchestration logic.
- **Storage:** Cloudflare R2 interfaced via `boto3`.
- **Deployment:** Render.

## 5. Non-Functional Requirements
- **Performance:** Asynchronous AI generation and streaming responses to prevent UI blocking or request timeouts.
- **Scalability:** Stateless REST API design allowing horizontal backend scaling.
- **Security:** 
  - JWT-based authentication validated via Clerk.
  - Securely scoped database queries ensuring users can only access or mutate trips they are explicitly part of.
  - Strict server-side environment variable management; no API keys exposed to the client.
- **UX/UI:** Highly polished, responsive design that works seamlessly across desktop and mobile devices.

## 6. Future Roadmap (Post-MVP)
- **Direct Booking:** Integration with booking APIs (e.g., Duffel, Amadeus) for direct flight/hotel purchasing within the app.
- **Real-Time Collaboration:** WebSockets integration for Google Docs-style live editing of itineraries.
- **Offline Mode:** Progressive Web App (PWA) capabilities allowing travelers to access their itinerary and files without internet access.
- **Social Discovery:** Ability to publish and share read-only itineraries with the public community.
