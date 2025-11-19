<!-- cfbbe414-01c1-4971-b001-65e84f2d4ebc cfaa88f2-4578-4587-9f4c-d634dec326cf -->
# Frontend Implementation Plan

## Overview

Build a modern React frontend using MUI Base UI components that provides a complete interface for all knowledgebase features. The application will follow SOLID principles with a clean architecture, proper separation of concerns, and reusable components.

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: MUI Base UI (headless components)
- **Styling**: CSS Modules + CSS Variables for theming
- **State Management**: Zustand (lightweight, follows DIP)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form + Zod validation
- **Date/Time**: date-fns
- **Icons**: Lucide React

## Architecture & SOLID Principles

### Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/                    # API client layer (DIP)
│   │   ├── client.ts          # Axios instance
│   │   ├── endpoints.ts       # API endpoint definitions
│   │   └── services/          # Service abstractions
│   │       ├── ChatService.ts
│   │       ├── QueryService.ts
│   │       ├── ProfileService.ts
│   │       ├── IngestionService.ts
│   │       └── KnowledgeService.ts
│   ├── components/             # UI Components (SRP)
│   │   ├── common/            # Reusable base components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   └── Loading/
│   │   ├── chat/              # Chat-specific components
│   │   │   ├── ChatList/
│   │   │   ├── ChatWindow/
│   │   │   ├── MessageBubble/
│   │   │   └── ChatInput/
│   │   ├── query/             # Query interface
│   │   │   ├── QueryPanel/
│   │   │   ├── QueryOptions/
│   │   │   └── ResultsDisplay/
│   │   ├── profile/           # User profile
│   │   │   └── ProfileForm/
│   │   ├── ingestion/         # Document ingestion
│   │   │   └── IngestionForm/
│   │   ├── knowledge/         # Knowledge graph
│   │   │   ├── GraphViewer/
│   │   │   └── EntityCard/
│   │   └── layout/            # Layout components
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       └── MainLayout/
│   ├── hooks/                 # Custom hooks (SRP)
│   │   ├── useChat.ts
│   │   ├── useQuery.ts
│   │   ├── useProfile.ts
│   │   └── useApi.ts
│   ├── stores/                # Zustand stores (state management)
│   │   ├── chatStore.ts
│   │   ├── queryStore.ts
│   │   ├── profileStore.ts
│   │   └── appStore.ts
│   ├── types/                 # TypeScript types/interfaces
│   │   ├── api.types.ts
│   │   ├── chat.types.ts
│   │   ├── query.types.ts
│   │   └── profile.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── styles/                # Global styles & themes
│   │   ├── variables.css
│   │   ├── themes.css
│   │   └── globals.css
│   ├── pages/                 # Page components (route handlers)
│   │   ├── ChatPage.tsx
│   │   ├── QueryPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── IngestionPage.tsx
│   │   ├── KnowledgePage.tsx
│   │   └── DashboardPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Features Implementation

### 1. Chat Management

- **Components**: `ChatList`, `ChatWindow`, `MessageBubble`, `ChatInput`
- **Features**:
  - Create new chat sessions (admin/user)
  - List all chats with metadata
  - View chat history with pagination
  - Real-time message display
  - Chat type indicators
- **SOLID**: Separate chat UI from data fetching (hooks), service layer abstraction

### 2. Query Interface

- **Components**: `QueryPanel`, `QueryOptions`, `ResultsDisplay`
- **Features**:
  - Text input with model selection
  - Advanced options (useRAG, useGraph, useHybrid, useIterative)
  - RAG configuration (limit, threshold, graphDepth, maxIterations)
  - Display results with sources
  - Show metadata (agents used, tools used, iterations)
- **SOLID**: Query logic separated into hooks, options component extensible (OCP)

### 3. Document Ingestion

- **Components**: `IngestionForm`
- **Features**:
  - Text input or file upload
  - Metadata fields (title, source, author)
  - Progress indicator
  - Success/error feedback
- **SOLID**: Form logic in custom hook, validation separated

### 4. User Profile Management

- **Components**: `ProfileForm`
- **Features**:
  - Create/update profile
  - Fields: username, email, phone, address
  - Preferences (JSON editor)
  - Custom fields (key-value pairs)
- **SOLID**: Form component reusable, validation in utils

### 5. Knowledge Graph Visualization

- **Components**: `GraphViewer`, `EntityCard`
- **Features**:
  - Entity search
  - Entity details with relationships
  - Graph statistics display
  - Relationship visualization (using vis-network or similar)
- **SOLID**: Visualization logic separate from data fetching

### 6. System Dashboard

- **Components**: Dashboard widgets
- **Features**:
  - System health status
  - Available models list
  - Graph statistics
  - Recent activity
- **SOLID**: Widget components independent, composable

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

- Each component has one clear purpose
- Hooks handle specific data operations
- Services handle API communication only
- Utils contain pure functions

### Open/Closed Principle (OCP)

- Base components (Button, Input) extensible via props
- Query options component accepts custom options
- Service interfaces allow extension without modification

### Liskov Substitution Principle (LSP)

- Base components can be substituted by specialized versions
- Service interfaces ensure consistent behavior

### Interface Segregation Principle (ISP)

- Small, focused interfaces for components
- Separate hooks for different concerns
- TypeScript interfaces for type safety

### Dependency Inversion Principle (DIP)

- Components depend on service abstractions, not implementations
- API client injected via context or props
- Stores abstract state management

## Implementation Steps

1. **Project Setup**

   - Initialize Vite + React + TypeScript project
   - Install dependencies (MUI Base, Zustand, React Router, Axios, etc.)
   - Configure build tools and paths

2. **Core Infrastructure**

   - Set up API client with interceptors
   - Create service layer abstractions
   - Set up Zustand stores
   - Configure routing

3. **Base Components** (using MUI Base)

   - Button, Input, Select, Modal, Card
   - Loading states, Error boundaries
   - Theme provider and styling system

4. **Feature Components**

   - Chat management components
   - Query interface components
   - Profile form
   - Ingestion form
   - Knowledge graph viewer

5. **Pages & Routing**

   - Dashboard page
   - Chat page
   - Query page
   - Profile page
   - Ingestion page
   - Knowledge page

6. **Integration & Polish**

   - Connect all features to API
   - Error handling and loading states
   - Responsive design
   - Dark mode support
   - Accessibility improvements

## API Integration

All API endpoints from `server.js` will be integrated:

- `/api/chat/create`, `/api/chat/:chatId`, `/api/chat/:chatId/history`
- `/api/query`, `/api/query/direct`
- `/api/ingest`
- `/api/profile`, `/api/profile/:userId`
- `/api/knowledge/:id`
- `/api/stats/graph`
- `/api/health`, `/api/models`

## Styling Approach

- CSS Variables for theming (light/dark mode)
- CSS Modules for component-scoped styles
- Base UI components are unstyled - we'll apply custom CSS to all component parts
- Responsive breakpoints
- Consistent spacing and typography system
- Base UI uses composition pattern - components assembled from parts (Root, Trigger, Portal, etc.)

## Testing Strategy (Future)

- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for API services
- E2E tests for critical flows

## Documentation

- Component documentation in `docs/` folder
- API integration guide
- Architecture diagrams
- Usage examples

### To-dos

- [ ] Initialize Vite + React + TypeScript project, install dependencies (MUI Base, Zustand, React Router, Axios, React Hook Form, Zod), configure build tools
- [ ] Create API client with Axios, define service layer abstractions (ChatService, QueryService, ProfileService, IngestionService, KnowledgeService), set up error handling and interceptors
- [ ] Set up Zustand stores (chatStore, queryStore, profileStore, appStore) with proper TypeScript types
- [ ] Build base UI components using MUI Base: Button, Input, Select, Modal, Card, Loading, ErrorBoundary. Implement theming system with CSS variables
- [ ] Set up React Router, create MainLayout with Header and Sidebar, implement navigation structure
- [ ] Build chat management: ChatList, ChatWindow, MessageBubble, ChatInput components. Create useChat hook. Integrate with chat API endpoints
- [ ] Build query interface: QueryPanel, QueryOptions, ResultsDisplay. Create useQuery hook. Support all query options (RAG, Graph, Hybrid, Iterative)
- [ ] Build ProfileForm and IngestionForm components with React Hook Form + Zod validation. Integrate with respective APIs
- [ ] Build GraphViewer and EntityCard components. Integrate graph visualization library. Connect to knowledge graph API endpoints
- [ ] Create Dashboard page with system health, models list, graph statistics widgets. Connect all remaining API endpoints
- [ ] Implement responsive design, dark mode support, error handling, loading states, accessibility improvements, and final UI polish