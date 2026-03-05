# TMS Frontend

A **Transportation Management System** frontend built with Vite + React, TypeScript, and Apollo GraphQL. Designed for managing shipments, users, and logistics workflows with role-based access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Data Fetching | Apollo Client (GraphQL) |
| Auth | JWT + Role-based Guards |
| Styling | CSS Modules / App.css |
| Routing | React Router |
| i18n | JSON locale files |

---

## Project Structure

```
tms-frontend/
├── public/
├── src/
│   ├── apollo/
│   │   └── client.ts                  # Apollo Client setup & cache config
│   │
│   ├── assets/                        # Static assets (images, icons, fonts)
│   │
│   ├── auth/
│   │   ├── AuthProvider.tsx           # Global auth context & session management
│   │   ├── RoleGuard.tsx              # Component-level role enforcement
│   │   └── TokenService.ts            # JWT storage, parsing, and refresh logic
│   │
│   ├── common/
│   │   └── constant.ts                # App-wide constants
│   │
│   ├── components/
│   │   ├── features/                  # Domain-specific components
│   │   │   ├── shipments/             # Shipment UI components
│   │   │   └── users/                 # User management components
│   │   ├── shared/                    # Cross-domain, app-aware components
│   │   │   ├── HamburgerMenu.tsx
│   │   │   ├── HorizontalMenu.tsx
│   │   │   └── TileActionsMenu.tsx
│   │   └── ui/                        # Generic, stateless UI primitives
│   │       ├── CopyButton.tsx
│   │       ├── Field.tsx
│   │       ├── PasswordInput.tsx
│   │       ├── RangeSlider.tsx
│   │       ├── SearchSelect.tsx
│   │       ├── SelectField.tsx
│   │       └── Spinner.tsx
│   │
│   ├── config/
│   │   └── i18n/
│   │       ├── en.json                # English locale strings
│   │       └── index.ts               # i18n initialisation & export
│   │
│   ├── graphql/                       # GraphQL operations, split by domain
│   │   ├── auth/
│   │   │   ├── mutations.tsx
│   │   │   ├── queries.tsx
│   │   │   └── types.tsx
│   │   └── shipments/
│   │       ├── mutations.ts
│   │       ├── queries.ts
│   │       └── types.ts
│   │
│   ├── helpers/                       # Utility logic (auth & shipment helpers)
│   │   ├── auth.ts
│   │   └── shipments.ts
│   │
│   ├── hooks/
│   │   └── useAuth.tsx                # Auth state hook
│   │
│   ├── layouts/                       # Page layout wrappers
│   │   ├── AppLayout.tsx              # Authenticated app shell (nav, sidebar)
│   │   └── PublicLayout.tsx           # Unauthenticated layout (login, etc.)
│   │
│   ├── pages/                         # Route-level page components
│   │   ├── auth/
│   │   ├── shared/
│   │   ├── shipments/
│   │   └── users/
│   │
│   ├── routes/                        # Route guards
│   │   ├── GuestRoute.tsx             # Redirects authenticated users away
│   │   └── ProtectedRoute.tsx         # Redirects unauthenticated users to login
│   │
│   ├── types/                         # Shared TypeScript types & interfaces
│   │
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.ts
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js `>= 18.x`
- npm `>= 9.x` or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/tms-frontend.git
cd tms-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GRAPHQL_URI=http://localhost:4000/graphql
VITE_APP_ENV=development
```

> All env vars must be prefixed with `VITE_` to be accessible in the app.

### Running Locally

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

---

## Architecture Decisions

### Auth Flow

Authentication is handled via JWT stored and managed by `TokenService.ts`. The `AuthProvider` wraps the entire app and exposes auth state via context. Route-level protection is enforced by `ProtectedRoute` and `GuestRoute`. Component-level access control uses `RoleGuard`.

```
User visits route
     ↓
ProtectedRoute checks token validity (via TokenService)
     ↓
AuthProvider exposes user + role via context
     ↓
RoleGuard enforces per-component role restrictions
```

### GraphQL Layer

Operations are co-located by domain under `graphql/`. Each domain folder contains:
- `queries.ts` — read operations
- `mutations.ts` — write operations
- `types.ts` — TypeScript types matching the schema

Hooks in `hooks/` consume these operations and expose clean interfaces to components. Direct Apollo calls from components are discouraged.

### Component Hierarchy

```
pages/          ← route-level, composes features
  └── features/ ← domain logic, uses hooks & services
        └── ui/ ← stateless, no domain knowledge
```

`ui/` components must never import from `features/`, `hooks/`, or `services/`.

---

## Contributing

### Branch Naming

```
feature/short-description
fix/short-description
chore/short-description
```

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add shipment filter by status
fix: resolve token refresh race condition
chore: update apollo client version
```

### Adding a New Feature

1. Add GraphQL operations to `graphql/<domain>/`
2. Add business logic to `services/<domain>.service.ts`
3. Wrap in a custom hook under `hooks/`
4. Build UI components under `components/features/<domain>/`
5. Wire everything in `pages/`

---

## License

Private — All rights reserved.
