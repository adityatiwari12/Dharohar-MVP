# DHAROHAR - Frontend Architecture & Design System

## 1. Architecture Explanation

DHAROHAR's frontend architecture is built on a modular, feature-based structure to accommodate varied role requirements while maintaining a single cohesive React application. The application will center around a robust contextual routing system using React Router, protecting routes via a seamless, role-agnostic Context provider. 

### Core Architectural Decisions:
- **Feature-first Architecture**: Grouping components, hooks, and services by feature domains (e.g., `features/assets`, `features/licenses`) rather than technical concepts. This prevents sprawling folders as the project scales.
- **Service Layer Abstraction**: Axios will be encapsulated within an `apiClient` singleton. All API calls will be handled through domain-specific service files (e.g., `assetService.ts`). This ensures the UI components remain decoupled from backend implementation details.
- **Role-Based Access Control (RBAC)**: A `ProtectedRoute` wrapper component will handle authentication and authorization. Roles are provided dynamically by the user's JWT/session data and not hardcoded, ensuring flexibility.
- **Design System Architecture**: Adhering strictly to modern vanilla CSS modules or a well-structured global/variables CSS system to implement the required heritage-inspired, earth-tone visual language. The design avoids CSS-in-JS complexities to remain lean and performant.
- **Graceful WebGL Degradation**: The `Three.js` Public Explorer will be encapsulated in a lazy-loaded component wrapper with an `ErrorBoundary`. If WebGL fails, the user will be presented with an elegantly styled standard list/grid view of assets instead of a broken canvas.

---

## 2. Code Scaffolding

### Folder Structure
```text
src/
├── assets/                  # Static media, SVGs, fonts
├── components/              # Shared, generic UI elements 
│   ├── Button/
│   ├── Card/
│   └── Layout/              # Framed sections, decorative borders
├── config/
│   └── theme.css            # CSS variables for the color palette & typography
├── features/                # Domain specific modules
│   ├── auth/                # Login, Register, Auth Context
│   ├── dashboard/           # Role-based dashboard views
│   ├── public-explorer/     # Three.js Explorer tree implementation
│   └── assets/              # Asset upload forms, list views
├── hooks/                   # Shared custom hooks (e.g., useWindowSize)
├── routes/                  # Route definitions and ProtectedRoute
├── services/                # Axios interceptors and API calls
│   └── apiClient.ts
├── utils/                   # Helpers
├── App.tsx
└── index.tsx
```

### Routing Configuration Concept
Routes should map directly to roles, but the structural hierarchy allows standard modularity.

```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/explorer" element={<PublicExplorer />} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
     <Route path="/dashboard" element={<DashboardRouter />} />
     <Route path="/assets/new" element={<UploadAsset />} />
  </Route>
</Routes>
```

---

## 3. Axios Service Abstraction (`src/services/apiClient.ts`)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dharohar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for generic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle session expiry
      localStorage.removeItem('dharohar_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 4. Protected Route Implementation (`src/routes/ProtectedRoute.tsx`)

```tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth(); // Assume 'user' has a 'roles' array or 'role' string

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>; // Styled beautifully
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Check if the user has AT LEAST ONE of the allowed roles
    const hasAccess = allowedRoles.some(role => user.roles.includes(role));
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
```

---

## 5. Key Component Implementations

### Design System Configuration (`src/config/theme.css`)
```css
:root {
  /* Earth-tone Palette */
  --color-terracotta: #A14B3B;
  --color-burnt-umber: #6E3B2E;
  --color-muted-gold: #B08D57;
  --color-parchment: #F4EDE4;
  --color-forest: #2E5E4E;
  --color-text-main: #2C2A29;

  /* Typography */
  --font-serif: 'Playfair Display', 'Merriweather', serif;
  --font-sans: 'Inter', 'Outfit', sans-serif;

  /* Shadows - Soft only */
  --shadow-soft: 0 4px 12px rgba(44, 42, 41, 0.08);

  /* Layout Structure */
  --border-radius: 4px; /* Minimalist corners */
}

body {
  background-color: var(--color-parchment);
  color: var(--color-text-main);
  font-family: var(--font-sans);
  background-image: url('../assets/subtle-texture.png'); /* Subtle texture */
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
  color: var(--color-burnt-umber);
}
```

### Dashboard Layout Component (`src/components/Layout/DashboardLayout.tsx`)
```tsx
import React from 'react';
import './DashboardLayout.css';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="layout-container">
      <nav className="sidebar">
        <h1 className="brand-logo">DHAROHAR</h1>
        <ul className="nav-links">
           {/* Navigation links injected or handled dynamically */}
        </ul>
      </nav>
      <main className="content-area">
        <header className="page-header">
           <h2>{title}</h2>
           {/* Decorative SVG underline component here */}
           <div className="decorative-divider"></div>
        </header>
        <section className="framed-section">
          {children}
        </section>
      </main>
    </div>
  );
};
```

### Minimal 3D Tree Explorer (`src/features/public-explorer/TreeExplorer.tsx`)
```tsx
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface NodeData {
  id: string;
  community: string;
  description: string;
  position: [number, number, number];
}

const TreeNode = ({ node, onClick }: { node: NodeData, onClick: (n: NodeData) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // Gentle pulsing animation on hover
  useFrame((state) => {
    if (meshRef.current && hovered) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <mesh 
      position={node.position} 
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); onClick(node); }}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color={hovered ? '#B08D57' : '#2E5E4E'} /* Muted Gold on hover, Forest Green default */
        roughness={0.7}
      />
    </mesh>
  );
};

export const TreeExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Mock Data generated dynamically (ideally fetched via API)
  const nodes: NodeData[] = [
    { id: '1', community: 'Warli', description: 'Traditional painting', position: [1.5, 3, 0] },
    { id: '2', community: 'Bhil', description: 'Storytelling archives', position: [-2, 4, 1.2] },
    { id: '3', community: 'Gond', description: 'Tribal folklore', position: [0.5, 5, -1.5] },
  ];

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#F4EDE4" />

        {/* Central Trunk */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.5, 0.8, 6, 16]} />
          <meshStandardMaterial color="#6E3B2E" roughness={0.9} /> {/* Burnt Umber */}
        </mesh>

        {/* Branches / Nodes */}
        {nodes.map(node => (
          <TreeNode key={node.id} node={node} onClick={setSelectedNode} />
        ))}

        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />
      </Canvas>

      {/* HTML Overlay for Metadata */}
      {selectedNode && (
        <div className="metadata-panel">
          <h3>Community: {selectedNode.community}</h3>
          <p>{selectedNode.description}</p>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}
    </div>
  );
};
```
