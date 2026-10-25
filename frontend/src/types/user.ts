import { UserRole } from '../constants/roles';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  companyName?: string;
  licenseNumber?: string;
  status?: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  isApproved?: boolean;
}
