export const THEME_CONFIG = {
  appName: 'RoadSense',
  appSubTitle: 'Municipal Infrastructure Lifecycle & Road Asset Monitoring',
  primaryColor: '#0F172A', // Executive dark slate
  paperBg: '#F8F9FA',      // Crisp light grey background
  surfaceCard: '#FFFFFF',  // Pure white
  surfaceBorder: '#E5E7EB',// Clean 1px border
  inkPrimary: '#0F172A',   // Deep slate
  inkMuted: '#64748B',     // Slate grey

  severityColors: {
    LOW: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
      hex: '#059669',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-600',
      hex: '#D97706',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      dot: 'bg-orange-600',
      hex: '#EA580C',
      label: 'High',
    },
    CRITICAL: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-600',
      hex: '#DC2626',
      label: 'Critical',
    },
  },

  statusColors: {
    REPORTED: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
    VERIFIED: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    ASSIGNED: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    COMPLETED: {
      bg: 'bg-slate-100',
      text: 'text-slate-900',
      border: 'border-slate-300',
    },
  },
};
