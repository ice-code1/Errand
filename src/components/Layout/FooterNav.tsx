// components/Layout/FooterNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, PlusCircle, Shield, User } from 'lucide-react';

export const FooterNav: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/tasks', label: 'Tasks', icon: List },
    { to: '/create-task', label: 'Create', icon: PlusCircle },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  links.push({ to: '/profile', label: 'Profile', icon: User });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center text-xs ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'stroke-blue-600' : ''}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
