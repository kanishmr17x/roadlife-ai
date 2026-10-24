import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ShieldCheck, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('demo-session-token', {
      id: `usr-${Date.now().toString(36)}`,
      email,
      fullName,
      role,
    });
    navigate(ROUTES.CITIZEN.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F3EC] text-[#252A24]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844] mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#252A24]">Register Observer</h1>
          <p className="text-xs text-[#6F726A]">Join the RoadSense municipal road inspection network</p>
        </div>

        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm space-y-4 p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-[#6F726A]" />}
            />
            <Input
              label="Email Address"
              required
              type="email"
              placeholder="priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-[#6F726A]" />}
            />
            <Input
              label="Password"
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[#6F726A]" />}
            />

            <div>
              <label className="block text-xs font-medium text-[#252A24] mb-1.5">Designated Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-[#252A24] text-xs py-2.5 px-3 focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
              >
                <option value={UserRole.CITIZEN}>Citizen Observer</option>
                <option value={UserRole.CONTRACTOR}>Road Contractor / Field Engineer</option>
                <option value={UserRole.GOVERNMENT}>Municipal / PWD Oversight Officer</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-3">
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE]">
            <span>Already registered? </span>
            <Link to={ROUTES.LOGIN} className="text-[#355844] font-medium hover:underline">
              Sign In to Platform
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
