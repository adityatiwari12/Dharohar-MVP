# Product Definition Document: Dharohar

**Project Name:** Dharohar
**Tagline:** Safeguarding India’s Wisdom with Digital Sovereignty.
**Vision:** To transform the "Intangible Cultural Heritage" of rural India—its oral remedies, handicrafts, and folklore—into verifiable, legally defensible, and economically viable digital assets.

---

### 1. The Problem Statement

India’s indigenous communities possess vast intellectual capital, yet they remain economically marginalized. This paradox stems from three specific systemic failures in the current intellectual property (IP) regime:

**The "Prior Art" Gap (Bio-Piracy)**
The majority of tribal medicinal knowledge (80%) is oral. Under global patent standards (TRIPS), oral knowledge is rarely accepted as "Prior Art." This legal loophole allows pharmaceutical companies to patent traditional remedies—such as the antiseptic properties of Turmeric or the insecticidal properties of Neem—without compensating the original custodians. The community loses ownership of its own wisdom because they lack the documentation to prove they knew it first.

**The Authenticity Crisis (Counterfeiting)**
The handicraft sector faces an existential threat from mechanization. Powerloom machines can replicate a handwoven saree in 30 minutes, whereas a master weaver requires 30 days. To the untrained eye, the products are identical. The market is flooded with cheap machine-made fakes sold as "Handloom," collapsing price points. Genuine artisans cannot compete on price and are forced to abandon their craft, leading to rapid cultural extinction.

**The "Liquid Asset" Failure**
A tribal weaver or healer currently has no mechanism to "license" their skill. They can only sell the physical product (the herb or the fabric). They cannot monetize the underlying IP (the design, the formulation, or the song) itself. Consequently, these communities remain "Asset Rich, but Cash Poor," holding billions in potential value but zero liquidity.

---

### 2. Problem Alignment & Relevance

Solving this requires timing and context. Three factors make this the right moment for intervention:

* **Legal Urgency:** The *Nagoya Protocol* and India’s *Biological Diversity Act, 2002* mandate "Access and Benefit Sharing" (ABS). However, enforcement is impossible without digital infrastructure to track who is using what knowledge.
* **Economic Shift:** The "Creator Economy" model has matured for urban digital artists. Rural creators deserve similar Digital Rights Management (DRM) tools to participate in the global economy.
* **Technological Readiness:** We finally possess the specific AI capabilities—Generative AI for dialect transcription and Computer Vision for texture analysis—required to validate these complex, unstructured assets at scale.

---

### 3. The Solution: Dharohar Platform

Dharohar is a Digital Sovereignty Infrastructure. It functions as a multi-modal bridge between the Oral/Unorganized Sector and the Formal IP Economy.

It operates on a strict **"Digitize -> Validate -> Monetize"** framework across three specialized modules:

**Module A: Dharohar-Bio (The Green Vault)**
* **Function:** Safeguards Ethnobotanical Knowledge.
* **Mechanism:** Converts voice notes of traditional remedies into "Prior Art Dossiers" compliant with the National Biodiversity Authority (NBA).
* **Goal:** Prevents bio-piracy and enables paid licensing for scientific research.

**Module B: Dharohar-Craft (The Loom Ledger)**
* **Function:** Validates Handicraft Authenticity.
* **Mechanism:** Uses AI Forensics to analyze weave patterns and material texture, creating a "Digital Twin" of the physical product.
* **Goal:** Eliminates counterfeits and justifies the "Handmade Premium" price point.

**Module C: Dharohar-Sonic (The Cultural Copyright)**
* **Function:** Protects Folklore and Music.
* **Mechanism:** Fingerprints audio to track unauthorized usage in commercial media (films/remixes).
* **Goal:** Secures royalties for community artists.

---

### 4. Key Features & Functional Requirements

**Core Features for All Modules**
1.  **Vernacular Voice-First Interface:** The application functions entirely via voice commands in local dialects (Gondi, Bhili, Malwi), ensuring zero literacy barriers for the user.
2.  **Geospatial Time-Stamping:** Every upload is tagged with immutable GPS coordinates and a timestamp to establish "Geographical Indication" (GI) proof.
3.  **The "Sovereignty" Wallet:** A built-in digital wallet for every Gram Sabha (Village Council) to receive royalties directly, split automatically via Smart Contracts.

**Module-Specific Features**
* **Bio-Module:**
    * **Auto-Taxonomy:** AI automatically maps local plant names (e.g., "Hadjod") to scientific species ("Cissus quadrangularis") using a connected botanical knowledge graph.
    * **Form-1 Generator:** One-click generation of the specific legal PDF required by the Biodiversity Act for filing claims.
* **Craft-Module:**
    * **Forensic Scan:** A camera feature utilizing 10x digital zoom to analyze thread count and "human error" patterns—imperfections that mathematically prove a product is hand-woven.
    * **QR Digital Passport:** Generates a unique QR code for the physical product. Buyers scan this to view the source video of the weaver making that exact item.

---

### 5. Role-Based Access Control (RBAC)

Governance is critical when handling sensitive cultural data. We define four distinct user roles to ensure security and trust:

| Role | User Persona | Access Level | Permissions |
| :--- | :--- | :--- | :--- |
| **Creator** | Tribal Elder, Weaver, Artisan | **Level 1 (Source)** | **Write:** Upload Audio/Video.<br>**Read:** View own portfolio & wallet.<br>**Restriction:** Cannot view other tribes' data (prevents inter-tribal IP conflict). |
| **Verifier** | Subject Matter Expert (Botanist, Textile Ministry) | **Level 2 (Gatekeeper)** | **Read:** View pending uploads in their domain.<br>**Action:** "Approve" (Mint Asset) or "Reject" (Flag Issue).<br>**Write:** Add scientific metadata or validation tags. |
| **Buyer** | Pharma Researcher, Fashion Brand | **Level 3 (Consumer)** | **Read:** Browse "Public Metadata" (e.g., "Herb for fever") but *not* the proprietary recipe.<br>**Action:** Purchase License / Pay Royalties to unlock full data. |
| **Admin** | Platform Maintainer | **Level 4 (System)** | **System:** Manage User Roles, API Keys, and Audit Logs.<br>**Restriction:** No access to decrypt sensitive "Trade Secrets" stored in the vault. |

---

### 6. Technical Workflow (The "Happy Path")

1.  **Ingestion:** The **Creator** records a video of a weaving technique. The App uploads this to the cloud along with authenticated GPS data.
2.  **AI Analysis:** The system routes the video to the **Computer Vision Engine**. The model analyzes the frames and assigns an "Authenticity Score" (e.g., 98% probability of handloom).
3.  **Validation:** The **Verifier** receives a notification. They review the AI score and the source video. Upon satisfaction, they click "Verify."
4.  **Minting:** The system triggers the **Blockchain Layer**. A "Digital Twin" token is created for that specific weave.
5.  **Monetization:** A **Buyer** (e.g., a retail brand) scans the token and pays a licensing fee.
6.  **Distribution:** The **Smart Contract** automatically executes the split: 80% transfers to the Weaver’s Wallet, 20% to the Platform maintenance fund.