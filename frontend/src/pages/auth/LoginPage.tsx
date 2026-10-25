import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { authService } from '../../services/auth/authService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { HealthStatusPill } from '../../components/common/HealthStatusPill';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  UserCheck, 
  HardHat, 
  Landmark, 
  Lock, 
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Building2
} from 'lucide-react';

interface PortalConfig {
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  accentColor: string;
  emailLabel: string;
  placeholder: string;
  helpText: string;
  footerAction: React.ReactNode;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  // Selected portal view: null = portal choice screen, UserRole = dedicated login form
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const resetFormState = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    setPendingNotice(null);
  };

  const handlePortalSelect = (role: UserRole) => {
    resetFormState();
    setSelectedPortal(role);
  };

  const handleBackToPortals = () => {
    resetFormState();
    setSelectedPortal(null);
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setPendingNotice(null);

    try {
      const response = await authService.login({
        email,
        password,
        portalRole: selectedPortal || undefined
      });

      // Update auth context state with valid server-issued token and user profile
      login(response.token, response.user);

      // Resolve redirect target: return to requested page if permitted, else role dashboard
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

      if (fromPath && !fromPath.startsWith('/login') && !fromPath.startsWith('/register')) {
        navigate(fromPath, { replace: true });
        return;
      }

      if (response.user.role === UserRole.CONTRACTOR) {
        navigate(ROUTES.CONTRACTOR.DASHBOARD, { replace: true });
      } else if (
        response.user.role === UserRole.GOVERNMENT ||
        response.user.role === UserRole.MUNICIPAL_AUTHORITY ||
        response.user.role === UserRole.ADMIN
      ) {
        navigate(ROUTES.GOVERNMENT.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.CITIZEN.DASHBOARD, { replace: true });
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error;
      const errorCode = err.response?.data?.code;

      if (errorCode === 'PENDING_APPROVAL') {
        setPendingNotice(
          serverError ||
            'Your contractor account is currently pending municipal authority approval or has been disabled.'
        );
      } else {
        setErrorMessage(
          serverError || 'Authentication failed. Please verify your credentials and network connection.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Portal metadata configurations
  const citizenConfig: PortalConfig = {
    title: 'Citizen Observer Portal',
    subtitle: 'Public Pothole & Road Distress Reporting Desk',
    badge: 'Public Civic Access',
    badgeClass: 'bg-[#E5EADF] text-[#264031] border-[#78846A]/20',
    icon: <UserCheck className="w-5 h-5 text-[#355844]" />,
    accentColor: '#355844',
    emailLabel: 'Registered Citizen Email',
    placeholder: 'citizen@roadsense.local',
    helpText: 'Observer accounts allow citizens to submit geotagged road defects and track repair lifecycles.',
    footerAction: (
      <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE]">
        <span>Need an observer account? </span>
        <Link to={ROUTES.REGISTER} className="text-[#355844] font-medium hover:underline">
          Register as field observer
        </Link>
      </div>
    )
  };

  const contractorConfig: PortalConfig = {
    title: 'Road Contractor Portal',
    subtitle: 'Assigned Road Corridors & Construction Evidence Desk',
    badge: 'Accredited Contractors',
    badgeClass: 'bg-[#FAF0EF] text-[#87362F] border-[#B9684D]/20',
    icon: <HardHat className="w-5 h-5 text-[#B9684D]" />,
    accentColor: '#B9684D',
    emailLabel: 'Contractor Work Order Email',
    placeholder: 'contractor@buildinfra.in',
    helpText: 'Access restricted to approved construction enterprises with active municipal contracts.',
    footerAction: (
      <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE] space-y-1">
        <p>Contractor accounts require verified municipal license documentation.</p>
        <p className="text-[11px] text-[#78846A]">
          Contact the PWD Tender Registry for onboarding accreditation.
        </p>
      </div>
    )
  };

  const municipalConfig: PortalConfig = {
    title: 'Municipal Authority Portal',
    subtitle: 'Executive Infrastructure Oversight & Tender Verification',
    badge: 'Official PWD / BBMP Zone',
    badgeClass: 'bg-[#EAE8DF] text-[#252A24] border-[#6F726A]/30',
    icon: <Landmark className="w-5 h-5 text-[#252A24]" />,
    accentColor: '#252A24',
    emailLabel: 'Government / Municipal Officer Email',
    placeholder: 'officer@pwd.gov.in',
    helpText: 'Official municipal accounts require department administrative provisioning.',
    footerAction: (
      <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE]">
        <p className="text-[11px] text-[#6F726A]">
          Municipal administrative credentials are strictly provisioned by the State Infrastructure Council.
        </p>
      </div>
    )
  };

  const getPortalConfig = (role: UserRole): PortalConfig => {
    if (role === UserRole.CONTRACTOR) return contractorConfig;
    if (
      role === UserRole.MUNICIPAL_AUTHORITY ||
      role === UserRole.GOVERNMENT ||
      role === UserRole.ADMIN
    ) {
      return municipalConfig;
    }
    return citizenConfig;
  };

  const activeConfig = selectedPortal ? getPortalConfig(selectedPortal) : citizenConfig;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#F5F3EC] text-[#252A24]">
      <div className="w-full max-w-xl space-y-6">
        {/* Editorial Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844] mb-1 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#252A24]">
            RoadSense
          </h1>
          <p className="text-xs sm:text-sm text-[#6F726A] max-w-md mx-auto">
            Civic Field Notes • Infrastructure Lifecycle & Smart Repair Planning
          </p>
          <div className="pt-2 flex justify-center">
            <HealthStatusPill />
          </div>
        </div>

        {/* SCREEN 1: Three Distinct Entry Options */}
        {!selectedPortal && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#78846A]">
                Select Departmental Access Portal
              </span>
              <p className="text-xs text-[#6F726A] mt-0.5">
                Each portal requires authorized credentials for its respective role.
              </p>
            </div>

            <div className="grid gap-3.5">
              {/* Option A: Citizen Observer */}
              <Card className="bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#355844] shadow-xs hover:shadow-md transition-all duration-200 p-5 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-[#E5EADF] text-[#355844] border border-[#78846A]/20 shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#252A24] font-serif">
                          Citizen Observer
                        </h2>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5EADF] text-[#264031] font-medium border border-[#78846A]/20">
                          Public
                        </span>
                      </div>
                      <p className="text-xs text-[#6F726A] leading-relaxed">
                        Report road damage, submit geotagged photos, and track public repair progress.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-[#355844]/30 text-[#355844] hover:bg-[#355844] hover:text-white"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => handlePortalSelect(UserRole.CITIZEN)}
                  >
                    Continue to Citizen Login
                  </Button>
                </div>
              </Card>

              {/* Option B: Road Contractor */}
              <Card className="bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#B9684D] shadow-xs hover:shadow-md transition-all duration-200 p-5 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-[#FAF0EF] text-[#B9684D] border border-[#B9684D]/20 shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#252A24] font-serif">
                          Road Contractor
                        </h2>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF0EF] text-[#87362F] font-medium border border-[#B9684D]/20">
                          Accredited
                        </span>
                      </div>
                      <p className="text-xs text-[#6F726A] leading-relaxed">
                        Manage assigned road corridors, upload material verification, and log work orders.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-[#B9684D]/30 text-[#B9684D] hover:bg-[#B9684D] hover:text-white"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => handlePortalSelect(UserRole.CONTRACTOR)}
                  >
                    Continue to Contractor Login
                  </Button>
                </div>
              </Card>

              {/* Option C: Municipal Authority */}
              <Card className="bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#252A24] shadow-xs hover:shadow-md transition-all duration-200 p-5 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-[#EAE8DF] text-[#252A24] border border-[#6F726A]/30 shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#252A24] font-serif">
                          Municipal Authority
                        </h2>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EAE8DF] text-[#252A24] font-medium border border-[#6F726A]/30">
                          Executive
                        </span>
                      </div>
                      <p className="text-xs text-[#6F726A] leading-relaxed">
                        Oversee municipal road assets, monitor contractor compliance, and approve repair works.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-[#252A24]/30 text-[#252A24] hover:bg-[#252A24] hover:text-white"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => handlePortalSelect(UserRole.MUNICIPAL_AUTHORITY)}
                  >
                    Continue to Municipal Login
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SCREEN 2: Role-Specific Secure Login Form */}
        {selectedPortal && (
          <div className="space-y-4">
            <button
              onClick={handleBackToPortals}
              className="inline-flex items-center gap-1.5 text-xs text-[#6F726A] hover:text-[#252A24] font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>

            <Card className="bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm p-6 space-y-5">
              {/* Portal Header Indicator */}
              <div className="flex items-center justify-between border-b border-[#D8D7CE] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F5F3EC] border border-[#D8D7CE]">
                    {activeConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#252A24] font-serif">
                      {activeConfig.title}
                    </h2>
                    <p className="text-xs text-[#6F726A]">
                      {activeConfig.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium border ${activeConfig.badgeClass}`}
                >
                  {activeConfig.badge}
                </span>
              </div>

              {/* Alert: Generic / Role Mismatch Errors */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[#FAF0EF] border border-[#B9684D]/30 text-[#87362F] text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">Authentication Error</p>
                    <p className="text-[11px] leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Alert: Pending Contractor Approval Notice */}
              {pendingNotice && (
                <div className="p-3 rounded-lg bg-[#FFF9E6] border border-[#E0A800]/40 text-[#7A5A00] text-xs flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Account Pending Verification</p>
                    <p className="text-[11px] leading-relaxed">{pendingNotice}</p>
                  </div>
                </div>
              )}

              {/* Secure Credentials Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#252A24]">
                    {activeConfig.emailLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F726A]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder={activeConfig.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] placeholder:text-[#9E9F97] focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#252A24]">
                    Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F726A]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] placeholder:text-[#9E9F97] focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6F726A] hover:text-[#252A24] focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  disabled={loading}
                  isLoading={loading}
                >
                  {loading ? 'Authenticating...' : `Sign In to ${activeConfig.title}`}
                </Button>
              </form>

              {/* Portal-Specific Footer Context & Links */}
              {activeConfig.footerAction}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
