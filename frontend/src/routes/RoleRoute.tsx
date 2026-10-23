import React from 'react'; import { Outlet } from 'react-router-dom'; export const RoleRoute: React.FC<{ allowedRoles: string[] }> = () => <Outlet />;
