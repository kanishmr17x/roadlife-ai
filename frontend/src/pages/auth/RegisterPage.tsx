import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuthContext } from '../../context/AuthContext';
import { UserRole } from '../../constants/roles';
import { authService } from '../../services/auth/authService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ShieldCheck, User, Mail, Lock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        fullName,
        email,
        phone,
        password,
        role: UserRole.CITIZEN
      });

      if (response.token && response.user) {
        setSuccessMessage('Registration successful! Launching your field observer dashboard...');
        setTimeout(() => {
          login(response.token!, response.user!);
          navigate(ROUTES.CITIZEN.DASHBOARD);
        }, 1200);
      } else {
        setSuccessMessage('Account created successfully. Please sign in with your credentials.');
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 1500);
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F3EC] text-[#252A24]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 rounded-xl bg-[#E5EADF] border border-[#78846A]/20 text-[#355844] mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#252A24]">
            Register Observer
          </h1>
          <p className="text-xs text-[#6F726A]">
            Join the RoadSense civic road inspection and pothole reporting network
          </p>
        </div>

        <Card className="bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm space-y-4 p-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#FAF0EF] border border-[#B9684D]/30 text-[#87362F] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-[#EDF3EE] border border-[#355844]/30 text-[#264031] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              leftIcon={<User className="w-4 h-4 text-[#6F726A]" />}
            />
            <Input
              label="Email Address"
              required
              type="email"
              placeholder="priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leftIcon={<Mail className="w-4 h-4 text-[#6F726A]" />}
            />
            <Input
              label="Mobile Number (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              leftIcon={<Phone className="w-4 h-4 text-[#6F726A]" />}
            />
            <Input
              label="Create Secure Password"
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              leftIcon={<Lock className="w-4 h-4 text-[#6F726A]" />}
            />

            <div className="p-2.5 rounded bg-[#F5F3EC] border border-[#D8D7CE] text-[11px] text-[#6F726A] space-y-0.5">
              <span className="font-semibold text-[#252A24] block">Public Observer Registration</span>
              <p>
                This form provisions public citizen observer accounts. Road contractors and municipal officers must use official department onboarding or administrative provisioning.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              disabled={loading}
              isLoading={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Observer Registration'}
            </Button>
          </form>

          <div className="text-center text-xs text-[#6F726A] pt-3 border-t border-[#D8D7CE]">
            <span>Already have an account? </span>
            <Link to={ROUTES.LOGIN} className="text-[#355844] font-medium hover:underline">
              Sign In to Platform
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
