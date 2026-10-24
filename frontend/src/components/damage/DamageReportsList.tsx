import React, { useState } from 'react';
import { DamageFilter, DamageRecord } from '../../types/damage';
import { DamageSeverity } from '../../constants/status';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Spinner } from '../common/Spinner';
import { Search, MapPin, Calendar, ExternalLink, LayoutGrid, List } from 'lucide-react';

export interface DamageReportsListProps {
  damages: DamageRecord[];
  isLoading?: boolean;
  onSelectDamage: (damage: DamageRecord) => void;
  onRefresh?: () => void;
}

export const DamageReportsList: React.FC<DamageReportsListProps> = ({
  damages,
  isLoading = false,
  onSelectDamage,
}) => {
  const [filter, setFilter] = useState<DamageFilter>({
    searchQuery: '',
    severity: 'ALL',
    status: 'ALL',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter damages
  const filtered = damages.filter((d) => {
    if (filter.severity && filter.severity !== 'ALL' && d.severity !== filter.severity) {
      return false;
    }
    if (filter.status && filter.status !== 'ALL' && d.status !== filter.status) {
      return false;
    }
    if (filter.searchQuery && filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchRoad = d.roadName?.toLowerCase().includes(q);
      const matchAddr = d.address?.toLowerCase().includes(q);
      const matchType = d.damageType.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRoad && !matchAddr && !matchType) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#FFFEFA] p-2.5 sm:p-3 rounded-md border border-[#D8D7CE] shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#6F726A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search road, cavity type, or ID..."
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#F5F3EC]/70 border border-[#D8D7CE] text-xs text-[#252A24] placeholder-[#9E9F97] focus:outline-none focus:border-[#355844] focus:ring-1 focus:ring-[#355844]/20"
          />
        </div>

        {/* Severity & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value as any })}
            className="rounded bg-[#FFFEFA] border border-[#D8D7CE] text-xs text-[#252A24] py-1.5 px-2.5 focus:outline-none focus:border-[#355844]"
          >
            <option value="ALL">All Severities</option>
            <option value={DamageSeverity.CRITICAL}>Critical</option>
            <option value={DamageSeverity.HIGH}>High</option>
            <option value={DamageSeverity.MEDIUM}>Medium</option>
            <option value={DamageSeverity.LOW}>Low</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
            className="rounded bg-[#FFFEFA] border border-[#D8D7CE] text-xs text-[#252A24] py-1.5 px-2.5 focus:outline-none focus:border-[#355844]"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center rounded border border-[#D8D7CE] bg-[#F5F3EC] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' ? 'bg-[#FFFEFA] text-[#355844] shadow-sm' : 'text-[#6F726A] hover:text-[#252A24]'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${
                viewMode === 'table' ? 'bg-[#FFFEFA] text-[#355844] shadow-sm' : 'text-[#6F726A] hover:text-[#252A24]'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16">
          <Spinner size="md" label="Loading inspection records..." />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Incident Records Match Filters"
          description="Adjust your search terms or reset severity filters to display field inspection entries."
          actionLabel="Clear Filters"
          onAction={() => setFilter({ searchQuery: '', severity: 'ALL', status: 'ALL' })}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDamage(d)}
              className="bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#78846A] rounded-md p-4 transition-colors cursor-pointer flex flex-col justify-between shadow-sm group"
            >
              <div className="space-y-2.5">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="severity" severity={d.severity} size="sm" />
                    {d.isDemo && <Badge variant="demo" size="sm" />}
                  </div>
                  <Badge variant="status" status={d.status} size="sm" />
                </div>

                {/* Title & Desc */}
                <div>
                  <h4 className="text-sm font-bold text-[#252A24] group-hover:text-[#355844] transition-colors line-clamp-1">
                    {d.title}
                  </h4>
                  <p className="text-xs text-[#6F726A] mt-1 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                {/* Photo thumbnail if present */}
                {d.photoUrl && (
                  <div className="h-28 rounded overflow-hidden border border-[#D8D7CE] bg-[#F5F3EC]">
                    <img
                      src={d.photoUrl}
                      alt={d.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-[#D8D7CE] flex items-center justify-between text-[11px] text-[#6F726A]">
                <div className="flex items-center gap-1 truncate max-w-[170px]">
                  <MapPin className="w-3 h-3 text-[#78846A] shrink-0" />
                  <span className="truncate">{d.roadName || d.address || 'GeoJSON Coordinates'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                  <Calendar className="w-3 h-3 text-[#78846A]" />
                  {new Date(d.reportedAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-md border border-[#D8D7CE] bg-[#FFFEFA] shadow-sm">
          <table className="w-full text-left text-xs text-[#252A24]">
            <thead className="bg-[#F5F3EC] text-[#6F726A] uppercase text-[10px] tracking-wider border-b border-[#D8D7CE] font-mono">
              <tr>
                <th className="py-2.5 px-3">Defect / ID</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D7CE]/60">
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => onSelectDamage(d)}
                  className="hover:bg-[#F0F4EC] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-[#252A24] block leading-snug">{d.title}</span>
                    <span className="text-[10px] text-[#6F726A] font-mono">{d.id}</span>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-[#6F726A]">
                    {d.damageType.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="severity" severity={d.severity} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="status" status={d.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 truncate max-w-[180px] text-[#6F726A]">
                    {d.roadName || d.address || 'Point Coordinates'}
                  </td>
                  <td className="py-2.5 px-3 text-[#6F726A] font-mono whitespace-nowrap text-[11px]">
                    {new Date(d.reportedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDamage(d);
                      }}
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
