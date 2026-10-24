import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F5F3EC] text-[#252A24]">
      <Card className="max-w-md w-full text-center space-y-4 bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm p-8">
        <div className="p-3 bg-[#A9423B]/10 border border-[#A9423B]/20 rounded-xl w-fit mx-auto text-[#A9423B]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#252A24]">Access Restricted</h1>
        <p className="text-xs text-[#6F726A] leading-relaxed">
          Your current authenticated role does not possess permissions to view this administrative or contractor module.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to={ROUTES.CITIZEN.DASHBOARD}>
            <Button variant="primary" size="sm">
              Return to Citizen Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
