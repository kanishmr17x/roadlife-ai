import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { UserRole } from '../constants/roles';
import { useAuthContext } from '../context/AuthContext';
import { RoleRoute } from './RoleRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import ReportDamagePage from '../pages/citizen/ReportDamagePage';
import MyReportsPage from '../pages/citizen/MyReportsPage';
import ReportDetailsPage from '../pages/citizen/ReportDetailsPage';
import CitizenNotificationsPage from '../pages/citizen/CitizenNotificationsPage';
import CitizenProfilePage from '../pages/citizen/CitizenProfilePage';

import ContractorDashboard from '../pages/contractor/ContractorDashboard';
import AssignedRoadsPage from '../pages/contractor/AssignedRoadsPage';
import ContractorRoadDetailsPage from '../pages/contractor/ContractorRoadDetailsPage';
import ConstructionEvidencePage from '../pages/contractor/ConstructionEvidencePage';
import MaterialCapturePage from '../pages/contractor/MaterialCapturePage';
import MaterialVerificationPage from '../pages/contractor/MaterialVerificationPage';
import ComplaintsPage from '../pages/contractor/ComplaintsPage';
import ComplaintDetailsPage from '../pages/contractor/ComplaintDetailsPage';
import RepairTasksPage from '../pages/contractor/RepairTasksPage';
import RepairPlanningPage from '../pages/contractor/RepairPlanningPage';
import WeatherSchedulePage from '../pages/contractor/WeatherSchedulePage';
import CompletionEvidencePage from '../pages/contractor/CompletionEvidencePage';
import ContractorPerformancePage from '../pages/contractor/ContractorPerformancePage';
import ContractorNotificationsPage from '../pages/contractor/ContractorNotificationsPage';
import ContractorProfilePage from '../pages/contractor/ContractorProfilePage';

import GovernmentDashboard from '../pages/government/GovernmentDashboard';
import RoadManagementPage from '../pages/government/RoadManagementPage';
import CreateRoadPage from '../pages/government/CreateRoadPage';
import RoadMapPage from '../pages/government/RoadMapPage';
import GovernmentRoadDetailsPage from '../pages/government/GovernmentRoadDetailsPage';
import ConstructionMonitoringPage from '../pages/government/ConstructionMonitoringPage';
import MaterialReviewPage from '../pages/government/MaterialReviewPage';
import ComplaintManagementPage from '../pages/government/ComplaintManagementPage';
import RepairMonitoringPage from '../pages/government/RepairMonitoringPage';
import ContractorManagementPage from '../pages/government/ContractorManagementPage';
import ContractorDetailsPage from '../pages/government/ContractorDetailsPage';
import GovContractorPerformancePage from '../pages/government/ContractorPerformancePage';
import AnalyticsPage from '../pages/government/AnalyticsPage';
import NotificationManagementPage from '../pages/government/NotificationManagementPage';
import AuditLogsPage from '../pages/government/AuditLogsPage';
import GovernmentSettingsPage from '../pages/government/GovernmentSettingsPage';

/**
 * Intelligent home redirector based on authenticated user's role
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EC]">
        <div className="w-8 h-8 border-3 border-[#355844] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role === UserRole.CONTRACTOR) {
    return <Navigate to={ROUTES.CONTRACTOR.DASHBOARD} replace />;
  }

  if (
    user.role === UserRole.GOVERNMENT ||
    user.role === UserRole.MUNICIPAL_AUTHORITY ||
    user.role === UserRole.ADMIN
  ) {
    return <Navigate to={ROUTES.GOVERNMENT.DASHBOARD} replace />;
  }

  return <Navigate to={ROUTES.CITIZEN.DASHBOARD} replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root & Catch-all */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<RootRedirect />} />

      {/* Public Authentication Pages */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* Citizen Observer Protected Domain */}
      <Route element={<RoleRoute allowedRoles={[UserRole.CITIZEN, UserRole.ADMIN]} />}>
        <Route path={ROUTES.CITIZEN.DASHBOARD} element={<CitizenDashboard />} />
        <Route path={ROUTES.CITIZEN.REPORT} element={<ReportDamagePage />} />
        <Route path={ROUTES.CITIZEN.MY_REPORTS} element={<MyReportsPage />} />
        <Route path="/citizen/reports/:id" element={<ReportDetailsPage />} />
        <Route path={ROUTES.CITIZEN.NOTIFICATIONS} element={<CitizenNotificationsPage />} />
        <Route path={ROUTES.CITIZEN.PROFILE} element={<CitizenProfilePage />} />
      </Route>

      {/* Contractor Protected Domain */}
      <Route element={<RoleRoute allowedRoles={[UserRole.CONTRACTOR, UserRole.ADMIN]} />}>
        <Route path={ROUTES.CONTRACTOR.DASHBOARD} element={<ContractorDashboard />} />
        <Route path={ROUTES.CONTRACTOR.ROADS} element={<AssignedRoadsPage />} />
        <Route path="/contractor/roads/:id" element={<ContractorRoadDetailsPage />} />
        <Route path={ROUTES.CONTRACTOR.CONSTRUCTION_EVIDENCE} element={<ConstructionEvidencePage />} />
        <Route path={ROUTES.CONTRACTOR.MATERIAL_CAPTURE} element={<MaterialCapturePage />} />
        <Route path={ROUTES.CONTRACTOR.MATERIAL_VERIFICATION} element={<MaterialVerificationPage />} />
        <Route path={ROUTES.CONTRACTOR.COMPLAINTS} element={<ComplaintsPage />} />
        <Route path="/contractor/complaints/:id" element={<ComplaintDetailsPage />} />
        <Route path={ROUTES.CONTRACTOR.REPAIR_TASKS} element={<RepairTasksPage />} />
        <Route path={ROUTES.CONTRACTOR.REPAIR_PLANNING} element={<RepairPlanningPage />} />
        <Route path={ROUTES.CONTRACTOR.WEATHER_SCHEDULE} element={<WeatherSchedulePage />} />
        <Route path={ROUTES.CONTRACTOR.COMPLETION_EVIDENCE} element={<CompletionEvidencePage />} />
        <Route path={ROUTES.CONTRACTOR.PERFORMANCE} element={<ContractorPerformancePage />} />
        <Route path={ROUTES.CONTRACTOR.NOTIFICATIONS} element={<ContractorNotificationsPage />} />
        <Route path={ROUTES.CONTRACTOR.PROFILE} element={<ContractorProfilePage />} />
      </Route>

      {/* Municipal Authority / Government Protected Domain */}
      <Route
        element={
          <RoleRoute
            allowedRoles={[
              UserRole.GOVERNMENT,
              UserRole.MUNICIPAL_AUTHORITY,
              UserRole.ADMIN
            ]}
          />
        }
      >
        <Route path={ROUTES.GOVERNMENT.DASHBOARD} element={<GovernmentDashboard />} />
        <Route path={ROUTES.GOVERNMENT.ROADS} element={<RoadManagementPage />} />
        <Route path={ROUTES.GOVERNMENT.CREATE_ROAD} element={<CreateRoadPage />} />
        <Route path={ROUTES.GOVERNMENT.ROAD_MAP} element={<RoadMapPage />} />
        <Route path="/government/roads/:id" element={<GovernmentRoadDetailsPage />} />
        <Route path={ROUTES.GOVERNMENT.CONSTRUCTION_MONITORING} element={<ConstructionMonitoringPage />} />
        <Route path={ROUTES.GOVERNMENT.MATERIAL_REVIEW} element={<MaterialReviewPage />} />
        <Route path={ROUTES.GOVERNMENT.COMPLAINT_MANAGEMENT} element={<ComplaintManagementPage />} />
        <Route path={ROUTES.GOVERNMENT.REPAIR_MONITORING} element={<RepairMonitoringPage />} />
        <Route path={ROUTES.GOVERNMENT.CONTRACTORS} element={<ContractorManagementPage />} />
        <Route path="/government/contractors/:id" element={<ContractorDetailsPage />} />
        <Route path={ROUTES.GOVERNMENT.CONTRACTOR_PERFORMANCE} element={<GovContractorPerformancePage />} />
        <Route path={ROUTES.GOVERNMENT.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.GOVERNMENT.NOTIFICATIONS} element={<NotificationManagementPage />} />
        <Route path={ROUTES.GOVERNMENT.AUDIT_LOGS} element={<AuditLogsPage />} />
        <Route path={ROUTES.GOVERNMENT.SETTINGS} element={<GovernmentSettingsPage />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
