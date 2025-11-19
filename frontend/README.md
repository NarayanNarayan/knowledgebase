# AI Knowledge Base Frontend

A modern React frontend for the AI Knowledge Base system, built with Base UI components and following SOLID principles.

## Features

- **Chat Management**: Create and manage chat sessions with persistent history
- **Query Interface**: Advanced query interface with RAG, Graph, Hybrid, and Iterative options
- **Document Ingestion**: Upload and ingest documents into the knowledge base
- **User Profiles**: Manage user profile information with custom fields
- **Knowledge Graph**: Explore entities and relationships in the knowledge graph
- **Dashboard**: System health, models, and statistics overview

## Technology Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **Base UI** (@base-ui-components/react) for headless components
- **Zustand** for state management
- **React Router** for routing
- **Axios** for API communication
- **React Hook Form** + **Zod** for form validation
- **CSS Modules** for styling

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API server running on `http://localhost:3000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and services
│   ├── components/       # React components
│   │   ├── common/      # Reusable base components
│   │   ├── chat/        # Chat components
│   │   ├── query/       # Query interface components
│   │   ├── profile/     # Profile components
│   │   ├── ingestion/   # Ingestion components
│   │   ├── knowledge/   # Knowledge graph components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles and themes
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Features Overview

### Chat Management
- Create admin or user chat sessions
- View chat history with pagination
- Real-time message display
- Chat type indicators

### Query Interface
- Text input with model selection
- Advanced RAG options (hybrid search, iterative refinement)
- Graph integration options
- Results display with sources and metadata

### Document Ingestion
- Text input or file upload
- Metadata fields (title, source, author)
- Progress indicators

### User Profiles
- Create/update profiles
- Custom fields support
- JSON preferences editor

### Knowledge Graph
- Entity search
- Graph statistics
- Entity details with relationships

## SOLID Principles

The codebase follows SOLID principles:

- **Single Responsibility**: Each component has one clear purpose
- **Open/Closed**: Components are extensible via props
- **Liskov Substitution**: Base components can be substituted
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Components depend on abstractions

## Styling

- CSS Variables for theming (light/dark mode)
- CSS Modules for component-scoped styles
- Responsive design with mobile-first approach
- Dark mode support

## License

MIT

