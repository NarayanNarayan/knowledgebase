import * as React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ROUTES } from './utils/constants';

// Lazy load pages
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const QueryPage = React.lazy(() => import('./pages/QueryPage').then(m => ({ default: m.QueryPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const IngestionPage = React.lazy(() => import('./pages/IngestionPage').then(m => ({ default: m.IngestionPage })));
const KnowledgePage = React.lazy(() => import('./pages/KnowledgePage').then(m => ({ default: m.KnowledgePage })));

import { Loading } from './components/common/Loading';

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={<Loading fullScreen text="Loading..." />}>
    {children}
  </React.Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: ROUTES.CHAT,
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <ChatPage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.QUERY,
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <QueryPage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.INGESTION,
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <IngestionPage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
  },
  {
    path: ROUTES.KNOWLEDGE,
    element: (
      <ErrorBoundary>
        <MainLayout>
          <SuspenseWrapper>
            <KnowledgePage />
          </SuspenseWrapper>
        </MainLayout>
      </ErrorBoundary>
    ),
  },
]);

