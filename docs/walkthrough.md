# DHAROHAR - Production MongoDB Architecture

This update transitions the DHAROHAR backend from a basic mock-ready state to a robust, production-grade architecture.

## 1. Advanced Database Foundation
*   **Centralized Connection**: Refactored `db.js` for managed Mongoose connections with production-ready error handling.
*   **GridFS Integration**: Initialized a dedicated `uploads` bucket within MongoDB for secure, scalable binary storage of cultural media (Sonic/Bio).

## 2. Refined Schema Design & Validation
*   **Asset & License Models**: Added multi-level validation, text indexing for global search, and GridFS linkage (`mediaFileId`, `documentationFileId`).
*   **User Model**: Enforced role-based constraints and secure credential isolation (`select: false` for password hashes).
*   **New Community Model**: Dedicated structure for tracking tribal organizations and their verified status.
*   **Audit Logging**: Introduced a high-integrity `AuditLog` model to track every governance action (Archival, Licensing, Access).

## 3. Transactional Governance Workflows
*   **ACID Compliance**: Critical operations like `approveAsset` and `approveLicense` now utilize **MongoDB Transactions**.
*   **Atomic Auditing**: State changes and audit logs are recorded as a single atomic unit, ensuring no governance action goes unrecorded.

## 4. Observability & Error Handling
*   **Winston Logging**: Structured JSON logging for production monitoring, with dedicated `error.log` and `combined.log` files.
*   **Morgan Integration**: Real-time HTTP request logging streamed directly into the Winston transport.
*   **Global Error Middleware**: Standardized error responses across all API endpoints, including environment-aware stack traces.

## 5. File Storage API
*   **Storage Routes**: New `/storage` endpoints for secure file uploads via Multer and authenticated streaming of archived media.

## 6. Tribal Imagery Integration
*   **Authentic Visuals**: Replaced generic placeholders with high-quality images for the **Warli Tribe** and **Gond Community**.
*   **Vite Optimization**: Switched to structured TypeScript imports in `mockData.ts` to ensure consistent asset resolution and bundling.

![Featured Communities with Tribal Imagery](file:///C:/Users/ASUS/.gemini/antigravity/brain/c99c7110-5574-44f8-8c20-e94228a5b010/featured_communities_verification_1772438156737.png)

## 7. Verification Summary
*   **Server Stability**: Confirmed successful startup with GridFS bucket initialization.
*   **Logging Verification**: Verified that Winston correctly captures startup events and API requests.
*   **Schema Integrity**: Validated syntax and logic across all refactored models.

---

# DHAROHAR - Submission Details & Governance Polish

This update introduces a detailed view for community submissions, enabling users to see all metadata and transcripts associated with their archival records.

## 1. Submission Details View (Community Dashboard)
Community members can now click **"View Details"** on any of their submissions to open a comprehensive dossier modal.

### Key Capabilities:
*   **Archival Info**: Displays submission date, risk tier, and recordee name.
*   **Metadata Inspection**: Full visibility into performance context, categories, and categories.
*   **Media Preview**: Embedded audio or video player to verify the recorded cultural asset.
*   **Transcript Access**: Clearly displays oral history transcripts for verification.
*   **Reviewer Feedback**: Rejection reasons are shown prominently within the modal.

![Submission Detail Modal](file:///C:/Users/ASUS/.gemini/antigravity/brain/c99c7110-5574-44f8-8c20-e94228a5b010/.system_generated/screenshots/screenshot_1772434604928.png)

## 2. Technical Polish
*   **TypeScript Integrity**: Updated the `Asset` interface to include `metadata` and `transcript` for type-safe data handling.
*   **UX Consistency**: Utilized the platform's glassmorphic modal design and framed sections for a premium, institutional feel.
*   **Lint Cleanliness**: Removed unused imports across dashboard components to maintain codebase health.

## 3. Verification Summary
*   **Frontend**: Verified the modal opens, closes, and renders data correctly across different statuses.
*   **Backend Integration**: Confirmed `getMyAssets` correctly feeds the detailed data to the frontend.
*   **Responsive Design**: Verified modal scrolling and layout on various viewport sizes.

---

# DHAROHAR - Phase 1 Frontend Documentation

This document outlines the architecture, features, and current state of the Phase 1 development for the DHAROHAR platform's frontend.

## 1. Project Overview
DHAROHAR is an institutional governance platform designed to manage and license indigenous cultural knowledge and media. The frontend is built using **React** with **TypeScript** and **Vite**, aiming for an immersive, heritage-inspired aesthetic.

## 2. Core Technologies Used
*   **Framework**: React 18, Vite
*   **Language**: TypeScript
*   **Routing**: React Router DOM (v6)
*   **3D Rendering**: Three.js, `@react-three/fiber`, `@react-three/drei`
*   **Styling**: Vanilla CSS with strict variable-based design system (Earth Tones, Serif Headers).
*   **Icons**: `react-icons`
*   **State Management**: React Context ([AuthContext](../frontend/src/features/auth/AuthContext.tsx#10-16))

## 3. Architecture & Routing Systems
The application adheres to a feature-based folder structure (`src/features/...`). Route protection is handled via the [ProtectedRoute](../frontend/src/routes/ProtectedRoute.tsx#9-29) component and [AuthContext](../frontend/src/features/auth/AuthContext.tsx#10-16).

### 3.1 Public & Gateway Routes
*   `/` (Root public route): Automatically renders the [CulturalExplorer](../frontend/src/features/public-explorer/CulturalExplorer.tsx#22-176) component.
*   `/login`: A gateway for governance users to sign in. Includes dev-mock logins for different roles (`community`, `review`, `admin`, `general`).
*   `/register`: Currently a placeholder route for future institution onboarding.
*   `/cultural-explorer`: The split-screen homepage.
*   `/community/:id`: The dynamic Cultural Dossier page for specific communities.
*   `/marketplace`: The public-facing structured licensing interface.

### 3.2 Protected Dashboard Routes (Role-Based)
Protected routes sit behind `/dashboard` and render dynamically based on the current user's role:
*   `community`: Can access `/dashboard/assets/new` (UploadAsset form).
*   `review`: Recieves access to `/dashboard/review-queue` (ReviewDashboard).
*   `admin`: Receives access to `/dashboard/license-requests` (AdminDashboard).

---

## 4. Completed Interfaces & Features

### 4.1 Cultural Explorer & Login Gateway ([CulturalExplorer.tsx](../frontend/src/features/public-explorer/CulturalExplorer.tsx))
A split-screen introduction to the platform.
*   **Left Pane (Immersive)**: Features an interactive 3D tree ([TreeExplorer.tsx](../frontend/src/features/public-explorer/TreeExplorer.tsx)) using Three.js. Includes slow ambient rotation, 8 interacting hovering nodes that display community names, and seamless click routing to the community dossier. Features the rotating `image copy 2.png` ceremonial symbol.
*   **Right Pane (Login)**: Directly embeds the institutional role selection and login mechanism.
*   **Data Showcase**: Displays dynamic cards for Featured Communities, BioKnowledge, and Sonic Assets pulled from the central [mockData.ts](../frontend/src/data/mockData.ts).

### 4.2 Community Cultural Dossier ([CommunityDetail.tsx](../frontend/src/features/public-explorer/CommunityDetail.tsx))
A deeply structured detail view mapping to `/community/:id`.
*   **Architecture**: Header with attribution, overview text, and distinct sections for Traditional Knowledge (Bio) and Folk Music (Sonic).
*   **Functionality**: Clicking a knowledge card opens a full-screen React modal detailing the asset and license types.

### 4.3 Asset Marketplace ([Marketplace.tsx](../frontend/src/features/marketplace/Marketplace.tsx))
A filtering and browsing interface for licensable cultural assets.
*   **Features**: Sidebar filtering by `Asset Type` and `Risk Tier`. Sorting by Community name.
*   **Flow**: "Apply for License" buttons redirect unauthenticated users back to the root login gateway.

### 4.4 Governance Dashboards
*   **Review Dashboard**: Displays incoming assets (`mockPendingAssets`). Reviewers can verify cultural accuracy.
*   **Admin Dashboard**: Displays incoming marketplace applications (`mockLicenseRequests`). Admins can approve or deny contracts.
*   **Audio Triggers**: Both dashboards trigger [Notification_Sound.wav](../Assets/Notification_Sound.wav) strictly upon approving an asset or license request.

---

## 5. Current State & Pending Implementations (Empty/Mocked Features)

Phase 1 provides the UI/UX scaffolding. The following areas represent "empty" working logic awaiting backend integration in Phase 2:

### 5.1 Authentication ([AuthContext.tsx](../frontend/src/features/auth/AuthContext.tsx))
*   **Current State**: Handled entirely via mock data. Tokens are hardcoded (`mock-token-123`) and roles are injected via the frontend UI toggle.
*   **Pending**: Real JWT validation against the NodeJS backend.

### 5.2 Database & API Client ([apiClient.ts](../frontend/src/services/apiClient.ts))
*   **Current State**: Present and configured with interceptors, but currently unused. All data driving the Explorer, Marketplace, and Dashboards is static inside [src/data/mockData.ts](../frontend/src/data/mockData.ts).
*   **Pending**: Replacing `mockCommunities`, `mockPendingAssets`, and `mockLicenseRequests` with strict Axios `GET` requests to the upcoming MongoDB schemas.

### 5.3 File Uploads ([UploadAsset.tsx](../frontend/src/features/assets/UploadAsset.tsx))
*   **Current State**: The UI allows selecting files and entering metadata, but submission only triggers an alert.
*   **Pending**: Actual `multipart/form-data` asset transmission to cloud storage (e.g., AWS S3).

### 5.4 Audio/Media Playback
*   **Current State**: The UI includes placeholders and "Play Preview" text for Sonic assets in the Explorer and Community Dossier.
*   **Pending**: Valid object URLs mapping to streaming audio playback components. (Note: Only the governance `Notification_Sound` plays actually right now).

### 5.5 Registration
*   **Current State**: The Signup screen states "Registration API is pending integration." 
*   **Pending**: Account creation pipelines with email verification and institutional vetting.
