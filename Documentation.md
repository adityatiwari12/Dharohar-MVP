# DHAROHAR - Comprehensive Project Documentation

## 1. Project Overview
DHAROHAR is an institutional governance platform designed to manage and license indigenous cultural knowledge and media. The platform focuses on high-fidelity archival practices, structured licensing frameworks, and educational exploration. The frontend is built with React 19, TypeScript, and Vite, utilizing a modular, feature-based architecture.

## 2. Architecture & Design System
*   **Tech Stack**: React 19, TypeScript, Vite.
*   **Routing & Access**: React Router with a robust `ProtectedRoute` wrapper utilizing an `AuthContext` for Role-Based Access Control (RBAC). Roles include `general`, `community`, `review`, and `admin`.
*   **Design Language**: An earth-tone palette (Parchment, Burnt Umber, Terracotta, Muted Gold, Forest Green) utilizing vanilla CSS modules and variables. The design focuses on a heritage-inspired aesthetic with modern, performant glassmorphism and soft shadows.
*   **Service Layer**: Axios encapsulated within an `apiClient` singleton for modular API communications.

## 3. Development Phases & Milestones Achieved

### Phase 1: Foundation & Base Governance
*   **Public Access**: Implemented a split-screen Cultural Explorer homepage featuring a 3D Tree visualization (React Three Fiber) on the left and a quick institutional login portal on the right.
*   **Auth System**: Functional login system with dynamic role selection and protected route enforcement.
*   **Role-Based Dashboards**:
    *   **Community**: Knowledge submitter interface.
    *   **Reviewer**: Institutional review queue for incoming records.
    *   **Admin**: Platform-wide license management and oversight.
*   **Marketplace**: A filterable discovery grid for cultural assets with institutional attribution and licensing options.

### Phase 2: Dynamic Interactions & UX Polish
*   **Global Motion Hierarchy**: Implemented staggered fades and page transitions across dashboards for a premium feel.
*   **Loading States**: Added skeleton loaders and animated statistics counters to improve perceived performance.
*   **3D Enhancements**: Added interactive hover tooltips, click events, and scroll-to-section behaviors to the WebGL Tree Explorer.

### Phase 3: Deep Governance & Structured Archives
*   **Multi-Modal Submission Wizard**: 
    *   A two-step initiation tracking `DHAROHAR-BIO` (Knowledge) and `DHAROHAR-SONIC` (Media) assets.
*   **Real Media Archiving**: 
    *   Integrated the native browser `MediaRecorder` API for live audio (oral histories) and video (ritual performances) capture.
    *   Functional file upload handlers for `.mp3`, `.wav`, and `.mp4`.
    *   In-browser media preview players (`<audio>`, `<video>`) for self-verification prior to governance submission.
*   **Precise Geolocation Archiving**: 
    *   Integrated the native `navigator.geolocation` API with `enableHighAccuracy` to capture precise GPS coordinates for archival integrity.
    *   Real-time feedback UI with a re-detection refresh trigger.
*   **Institutional Review Workflow**: 
    *   Reviewers can inspect high-fidelity dossiers containing timestamps, GPS metadata, and submitting member details.
    *   Added reviewer comment sections for internal governance notes.
*   **Cultural Data Protection (License Wall)**: 
    *   Sensitive methodological details (e.g., preparation processes) are obfuscated for non-licensed viewers.
    *   Distinct dual-track licensing applications catering separately to "Research" and "Commercial" use cases.
*   **Universal Navigation**: 
    *   A history-aware Universal Back button implemented across all inner pages, enabling seamless transversal with role-aware fallbacks.
*   **Role-Based Navigation Restrictions**: 
    *   The "Public Explorer" view is strictly segregated from the administrative workflow; links are hidden for logged-in governance roles (Community, Reviewer, Admin) to maintain contextual focus.

## 4. Current State & Next Steps
*   **Current State**: The frontend business logic, multi-role routing, real media handling, and complex UI/UX components are entirely complete. The application successfully manages state locally and via mocks, presenting a high-fidelity, fully interactive prototype. User sessions, submission forms, and review queues operate smoothly.
*   **Next Phase**: As noted in the recent commit, the next phase will focus on robust Backend Integration. This will involve replacing the current `mockData.ts` and local state handlers with:
    *   MongoDB/Mongoose for persistent data storage.
    *   JWT/Passport implementation for secure, token-based authentication.
    *   Cloud storage (e.g., AWS S3 or GridFS) for permanent media asset archiving.
