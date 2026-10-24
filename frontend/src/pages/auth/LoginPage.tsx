import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { HealthStatusPill } from '../../components/common/HealthStatusPill';
import { 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  HardHat, 
  Landmark, 
  Lock, 
  Mail 
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    const demoProfiles = {
      [UserRole.CITIZEN]: {
        id: 'usr-demo-citizen',
        email: 'priya.citizen@roadsense.local',
        fullName: 'Priya Sharma (Citizen Inspector)',
        role: UserRole.CITIZEN,
      },
      [UserRole.CONTRACTOR]: {
        id: 'usr-demo-contractor',
        email: 'vikram.contractor@buildinfra.in',
        fullName: 'Vikram Patel (BuildInfra EPC)',
        role: UserRole.CONTRACTOR,
      },
      [UserRole.GOVERNMENT]: {
        id: 'usr-demo-gov',
        email: 'officer.gov@pwd.gov.in',
        fullName: 'Dr. Suresh Kumar (Executive Engineer)',
        role: UserRole.GOVERNMENT,
      },
      [UserRole.ADMIN]: {
        id: 'usr-demo-admin',
        email: 'admin@roadsense.local',
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
      },
    };

    login('demo-session-token', demoProfiles[role]);
    if (role === UserRole.CITIZEN) navigate(ROUTES.CITIZEN.DASHBOARD);
    else if (role === UserRole.CONTRACTOR) navigate(ROUTES.CONTRACTOR.DASHBOARD);
    else if (role === UserRole.GOVERNMENT) navigate(ROUTES.GOVERNMENT.DASHBOARD);
    else navigate(ROUTES.CITIZEN.DASHBOARD);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    // Default to citizen
    handleDemoLogin(UserRole.CITIZEN);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F3EC] text-[#252A24]">
      <div className="w-full max-w-md space-y-6">
        {/* Editorial Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844] mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#252A24]">RoadSense</h1>
          <p className="text-xs text-[#6F726A]">
            Civic Field Notes • Infrastructure Lifecycle & Repair Planning
          </p>
          <div className="pt-2 flex justify-center">
            <HealthStatusPill />
          </div>
        </div>

        {/* Demo Fast Access Card */}
        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm space-y-3 p-5">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#78846A] block text-center pb-2 border-b border-[#D8D7CE]">
            Direct Role Access (No Password Required)
          </span>

          <div className="space-y-2.5 pt-1">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-between border-[#D8D7CE] hover:border-[#355844] hover:bg-[#E5EADF]/30 text-[#252A24] text-xs font-medium"
              onClick={() => handleDemoLogin(UserRole.CITIZEN)}
              leftIcon={<UserCheck className="w-4 h-4 text-[#355844]" />}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#6F726A]" />}
            >
              Enter as Citizen Observer
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-between border-[#D8D7CE] hover:border-[#B9684D] hover:bg-[#B9684D]/10 text-[#252A24] text-xs font-medium"
              onClick={() => handleDemoLogin(UserRole.CONTRACTOR)}
              leftIcon={<HardHat className="w-4 h-4 text-[#B9684D]" />}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#6F726A]" />}
            >
              Enter as Road Contractor
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full justify-between border-[#D8D7CE] hover:border-[#355844] hover:bg-[#355844]/10 text-[#252A24] text-xs font-medium"
              onClick={() => handleDemoLogin(UserRole.GOVERNMENT)}
              leftIcon={<Landmark className="w-4 h-4 text-[#355844]" />}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 text-[#6F726A]" />}
            >
              Enter as Municipal Authority
            </Button>
          </div>
        </Card>

        {/* Standard Credentials Form */}
        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm space-y-4 p-5">
          <div className="text-xs text-[#6F726A] text-center font-medium">
            Or sign in with department credentials
          </div>

          {error && (
            <p className="text-xs text-[#A9423B] bg-[#A9423B]/10 p-2 rounded border border-[#A9423B]/20 text-center">
              ⚠ {error}
            </p>
          )}

          <form onSubmit={handleFormLogin} className="space-y-3">
            <Input
              label="Official Email Address"
              type="email"
              placeholder="engineer@bbmp.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-[#6F726A]" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[#6F726A]" />}
            />

            <Button type="submit" variant="primary" className="w-full mt-2">
              Sign In to Platform
            </Button>
          </form>

          <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE]">
            <span>Need an observer account? </span>
            <Link to={ROUTES.REGISTER} className="text-[#355844] font-medium hover:underline">
              Register as field observer
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
