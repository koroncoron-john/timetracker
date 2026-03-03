import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AdminProtectedRoute } from '../components/AdminProtectedRoute';
import UserLayout from '../components/UserLayout';

const HomePage = lazy(() => import('../pages/home/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const ProjectPage = lazy(() => import('../pages/project/page'));
const TrackerPage = lazy(() => import('../pages/tracker/page'));
const MyPage = lazy(() => import('../pages/mypage/page'));
const SubscriptionPage = lazy(() => import('../pages/subscription/page'));
const AdminLoginPage = lazy(() => import('../pages/admin-login/page'));
const AdminUsersPage = lazy(() => import('../pages/admin-users/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin-dashboard/page'));
const AdminInquiriesPage = lazy(() => import('../pages/admin-inquiries/page'));
const AdminConsultationsPage = lazy(() => import('../pages/admin-consultations/page'));
const AdminExpertsPage = lazy(() => import('../pages/admin-experts/page'));
const ConsultationPage = lazy(() => import('../pages/consultation/page'));
const ExpertRegisterPage = lazy(() => import('../pages/expert-register/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  // === 公開ページ ===
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // === ユーザー側ページ（UserLayout でラップ） ===
  {
    element: (
      <ProtectedRoute>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/project/:projectId',
        element: <ProjectPage />,
      },
      {
        path: '/tracker/:projectId',
        element: <TrackerPage />,
      },
      {
        path: '/mypage',
        element: <MyPage />,
      },
      {
        path: '/subscription',
        element: <SubscriptionPage />,
      },
      {
        path: '/consultation',
        element: <ConsultationPage />,
      },
    ],
  },

  // === 管理者ページ ===
  {
    path: '/expert-register',
    element: <Navigate to="/admin/experts" replace />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/users',
    element: (
      <AdminProtectedRoute>
        <AdminUsersPage />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <AdminProtectedRoute>
        <AdminDashboardPage />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/inquiries',
    element: (
      <AdminProtectedRoute>
        <AdminInquiriesPage />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/consultations',
    element: (
      <AdminProtectedRoute>
        <AdminConsultationsPage />
      </AdminProtectedRoute>
    ),
  },
  {
    path: '/admin/experts',
    element: (
      <AdminProtectedRoute>
        <AdminExpertsPage />
      </AdminProtectedRoute>
    ),
  },

  // === その他 ===
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

export default routes;
