import React, { useMemo, useState, useEffect } from 'react';
import Chip from './Chip';
import { useDebounce } from '../../hooks/useDebounce';

const Select = ({ label, value, onChange, options, placeholder, id }) => (
  <div>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <select 
      id={id}
      className="input min-h-[44px] text-base"
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
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
  const [localSearch, setLocalSearch] = useState(filters.query || '');
  const debouncedSearch = useDebounce(localSearch, 300);
  
  useEffect(() => {
    if (debouncedSearch !== filters.query) {
      onChange({ ...filters, query: debouncedSearch });
    }
  }, [debouncedSearch]);

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
          <label htmlFor="search-input" className="label">Search</label>
          <input
            id="search-input"
            type="search"
            className="input min-h-[44px] text-base"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search notes"
            autoComplete="off"
          />
        </div>
        <Select 
          id="university-select"
          label="University" 
          value={filters.universityId} 
          onChange={(v) => update({ universityId: v })} 
          options={universities} 
          placeholder="All Universities" 
        />
        <Select 
          id="department-select"
          label="Department" 
          value={filters.departmentId} 
          onChange={(v) => update({ departmentId: v })} 
          options={departments} 
          placeholder="All Departments" 
        />
        <div>
          <label htmlFor="semester-input" className="label">Semester</label>
          <input 
            id="semester-input"
            className="input min-h-[44px] text-base" 
            value={filters.semester || ''} 
            onChange={(e)=>update({ semester: e.target.value })} 
            placeholder="e.g. 5" 
            aria-label="Semester"
          />
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

