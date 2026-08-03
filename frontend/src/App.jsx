import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { DietProvider } from './context/DietContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MemberProfile from './pages/MemberProfile';
import MemberClassSchedule from './pages/MemberClassSchedule';
import MemberWorkoutPlan from './pages/MemberWorkoutPlan';
import MemberDietPlan from './pages/MemberDietPlan';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerMemberList from './pages/OwnerMemberList';
import OwnerMemberDetail from './pages/OwnerMemberDetail';
import OwnerPaymentList from './pages/OwnerPaymentList';
import OwnerStaffList from './pages/OwnerStaffList';
import OwnerClassSchedule from './pages/OwnerClassSchedule';
import OwnerRevenueReport from './pages/OwnerRevenueReport';
import OwnerBulkImport from './pages/OwnerBulkImport';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerMemberList from './pages/TrainerMemberList';
import TrainerMemberDetail from './pages/TrainerMemberDetail';
import TrainerClasses from './pages/TrainerClasses';
import TrainerWorkoutPlan from './pages/TrainerWorkoutPlan';
import TrainerDietPlan from './pages/TrainerDietPlan';
import Workouts from './pages/Workouts';
import DietTracker from './pages/DietTracker';
import ProgressTracker from './pages/ProgressTracker';
import Chat from './pages/Chat';
import Feed from './pages/Feed';
import Auth from './pages/Auth';
import PendingSignups from './pages/PendingSignups';

// Protected Route Component with Role Checks
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route Redirector based on user role
const DashboardRedirector = () => {
  const { user } = useAuth();
  if (user.role === 'owner') {
    return <Navigate to="/owner-dashboard" replace />;
  }
  if (user.role === 'trainer') {
    return <Navigate to="/trainer-dashboard" replace />;
  }
  return <Dashboard />;
};

function AppContent() {
  const { user, memberStatus } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {user && <Sidebar />}
      <div className={`flex-grow flex flex-col ${user ? 'pl-64' : ''}`}>
        {user && <Header />}
        {user && memberStatus === 'pending_approval' && (
          <div className="bg-amber-600 text-slate-950 px-6 py-3 font-bold text-center text-xs flex items-center justify-center gap-2 select-none shadow-lg animate-pulse">
            <AlertCircle size={16} />
            <span>Your account is pending approval from gym staff. Some features may be limited until approved.</span>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRedirector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workout-plan"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberWorkoutPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plan"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDietPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/members"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerMemberList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/members/:id"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerMemberDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/payments"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerPaymentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/revenue"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerRevenueReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/import"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerBulkImport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/staff"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerStaffList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trainer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/members"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerMemberList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/members/:id"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerMemberDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trainer/workout-plans"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerWorkoutPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/diet-plans"
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDietPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-tracker"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <DietTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute allowedRoles={['member', 'trainer']}>
                <ProgressTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['member', 'trainer']}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-signups"
            element={
              <ProtectedRoute allowedRoles={['owner', 'trainer']}>
                <PendingSignups />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Auth />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkoutProvider>
          <DietProvider>
            <AppContent />
          </DietProvider>
        </WorkoutProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
