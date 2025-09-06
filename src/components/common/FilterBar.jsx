import React, { useMemo } from 'react';
import Chip from './Chip';

const Select = ({ label, value, onChange, options, placeholder }) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder || 'All'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const FilterBar = ({
  filters,
  onChange,
  universities = [],
  departments = [],
  subjects = [],
  searchPlaceholder = 'Search notes, courses...'
}) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.universityId) chips.push({ key: 'universityId', label: `Uni: ${universities.find(u=>u.value===filters.universityId)?.label || filters.universityId}` });
    if (filters.departmentId) chips.push({ key: 'departmentId', label: `Dept: ${departments.find(d=>d.value===filters.departmentId)?.label || filters.departmentId}` });
    if (filters.subject) chips.push({ key: 'subject', label: `Subject: ${filters.subject}` });
    if (filters.semester) chips.push({ key: 'semester', label: `Sem: ${filters.semester}` });
    return chips;
  }, [filters, universities, departments]);

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 md:p-6 mb-6">
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <label className="label">Search</label>
          <input
            className="input"
            value={filters.query || ''}
            onChange={(e) => update({ query: e.target.value })}
            placeholder={searchPlaceholder}
          />
        </div>
        <Select label="University" value={filters.universityId} onChange={(v) => update({ universityId: v })} options={universities} placeholder="All Universities" />
        <Select label="Department" value={filters.departmentId} onChange={(v) => update({ departmentId: v })} options={departments} placeholder="All Departments" />
        <div>
          <label className="label">Semester</label>
          <input className="input" value={filters.semester || ''} onChange={(e)=>update({ semester: e.target.value })} placeholder="e.g. 5" />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeChips.map((c) => (
            <Chip key={c.key} variant="primary" onClose={() => update({ [c.key]: '' })}>{c.label}</Chip>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => onChange({})}>Clear</button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;

