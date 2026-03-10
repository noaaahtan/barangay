import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineExclamationCircle,
  HiOutlineClipboardDocumentList,
  HiArrowRightOnRectangle,
  HiXMark,
} from 'react-icons/hi2';

const adminNavItems = [
  { to: '/', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { to: '/applications', label: 'Applications', icon: HiOutlineDocumentText },
  { to: '/equipment-reservations', label: 'Equipment Reservations', icon: HiOutlineCalendarDays },
  { to: '/esumbong', label: 'E-Sumbong', icon: HiOutlineExclamationCircle },
  { to: '/audit-logs', label: 'Audit Logs', icon: HiOutlineClipboardDocumentList },
];

const citizenNavItems = [
  { to: '/', label: 'Dashboard', icon: HiOutlineSquares2X2 },
  { to: '/applications', label: 'My Applications', icon: HiOutlineDocumentText },
  { to: '/my-reservations', label: 'My Reservations', icon: HiOutlineCalendarDays },
  { to: '/esumbong', label: 'E-Sumbong', icon: HiOutlineExclamationCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = user?.role === 'admin' ? adminNavItems : citizenNavItems;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out',
        // Always visible on desktop (lg+), controlled by isOpen on mobile
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0',
      )}
    >
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
          <img
            src="/sta-ana-logo.png"
            alt="Barangay Sta Ana"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-500"
            aria-label="Close menu"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Logo - Desktop only */}
        <div className="hidden h-40 items-center justify-center border-b border-slate-100 px-4 lg:flex">
          <img
            src="/sta-ana-logo.png"
            alt="Barangay Sta Ana"
            className="h-36 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => {
                // Close sidebar on mobile when navigating
                if (onClose && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-brand-50/60 hover:text-brand-600',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-slate-100 px-4 py-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-500"
              >
                <HiArrowRightOnRectangle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
  );
}
