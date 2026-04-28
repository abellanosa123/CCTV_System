import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { Eye, FileSearch, FileOutput, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell as ReCell, LabelList
} from 'recharts';
import { X as CloseIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardParentHeader from '../components/DashboardParentHeader';

const COLORS = [
  '#8B5CF6', // Neon Purple
  '#06b6d4', // Bright Cyan
  '#f59e0b', // Amber/Orange
  '#10b981', // Emerald Green
  '#ec4899', // Hot Pink
  '#84cc16', // Lime Green
  '#f43f5e', // Rose Red
  '#6366f1'  // Indigo
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(20, 12, 50, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '12px',
        color: '#f0e6ff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: '#C4B5FD' }}>{label || payload[0].name}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || entry.fill }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [filter, setFilter] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === 'daily') params.date = selectedDate;
      if (filter === 'monthly') params.month = selectedMonth;
      if (filter === 'yearly') params.year = selectedYear;

      const res = await getDashboardStats(params);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filter, selectedDate, selectedMonth, selectedYear]);

  const getChangeIcon = (val) => {
    if (val > 0) return <TrendingUp size={14} />;
    if (val < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getChangeClass = (val) => {
    if (val > 0) return 'positive';
    if (val < 0) return 'negative';
    return 'neutral';
  };

  if (loading && !data) {
    return (
      <div>
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>Real-time CCTV monitoring overview</p>
        </div>
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  // Incident Distribution from Review Outcomes
  const incidentData = (data?.incidentDistribution || []).map((item, i) => ({
    name: item.type,
    fullName: item.type,
    value: item.count,
    breakdown: item.breakdown,
    fill: COLORS[i % COLORS.length]
  }));

  // Observation Incident Distribution (NEW)
  const obsIncidentData = (data?.observationIncidentDistribution || []).map((item, i) => ({
    name: item.type,
    fullName: item.type,
    value: item.count,
    breakdown: item.breakdown,
    fill: COLORS[i % COLORS.length]
  }));

  // Logs Overview — Action Taken counts from Observations
  const actionTakenData = (data?.actionTakenOverview || []).map((item, i) => ({
    name: item.action,
    fullName: item.action,
    value: item.count,
    breakdown: item.breakdown,
    fill: COLORS[i % COLORS.length]
  }));

  // Multi-Agency Response Data (NEW)
  const multiAgencyData = (data?.multiAgencyResponse || []).map((item, i) => ({
    name: item.agency,
    fullName: item.agency,
    value: item.count,
    breakdown: item.breakdown,
    fill: COLORS[i % COLORS.length]
  }));

  // Top Locations
  const locationData = (data?.topLocations || []).slice(0, 6).map((item) => ({
    name: item.location?.length > 20 ? item.location.slice(0, 18) + '...' : item.location,
    fullName: item.location,
    count: item.count,
    breakdown: item.breakdown
  }));

  // Top Incident Types from Review Logs
  const incidentTypeData = (data?.topIncidentTypes || []).slice(0, 6).map((item, i) => ({
    name: item.type,
    fullName: item.type,
    value: item.count,
    breakdown: item.breakdown,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div style={{ position: 'relative' }}>
      {/* Animated Background Orbs */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.08) 0%, transparent 70%)',
          top: '-100px', right: '-100px', animation: 'subtlePulse 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.06) 0%, transparent 70%)',
          bottom: '-80px', left: '-80px', animation: 'subtlePulse 10s ease-in-out infinite 2s'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <DashboardParentHeader />
        <PageHeader 
          title="Dashboard Overview" 
          subtitle={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                  animation: 'subtlePulse 2s ease-in-out infinite'
                }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Live Monitoring</span>
              </div>
              <span style={{ color: '#A78BFA' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          }
        >
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'center',
            background: 'rgba(15, 7, 32, 0.6)', backdropFilter: 'blur(12px)',
            padding: '10px 16px', borderRadius: '14px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            {filter === 'daily' && (
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '7px 12px', background: 'rgba(15, 12, 30, 0.7)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', fontSize: '12px' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            )}
            {filter === 'monthly' && (
              <input
                type="month"
                className="form-input"
                style={{ width: 'auto', padding: '7px 12px', background: 'rgba(15, 12, 30, 0.7)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', fontSize: '12px' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            )}
            {filter === 'yearly' && (
              <select
                className="form-input"
                style={{ width: 'auto', padding: '7px 12px', background: 'rgba(15, 12, 30, 0.7)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', fontSize: '12px' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </PageHeader>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-card-top">
            <div className="stat-card-icon blue"><Eye size={20} /></div>
            <div className={`stat-card-change ${getChangeClass(stats.observationChange)}`}>
              {getChangeIcon(stats.observationChange)}
              {Math.abs(stats.observationChange || 0)}%
            </div>
          </div>
          <div className="stat-card-value">{stats.totalObservations || 0}</div>
          <div className="stat-card-label">Total Observations</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-top">
            <div className="stat-card-icon purple"><FileSearch size={20} /></div>
            <div className={`stat-card-change ${getChangeClass(stats.reviewChange)}`}>
              {getChangeIcon(stats.reviewChange)}
              {Math.abs(stats.reviewChange || 0)}%
            </div>
          </div>
          <div className="stat-card-value">{stats.totalReviews || 0}</div>
          <div className="stat-card-label">Total CCTV Reviews</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-top">
            <div className="stat-card-icon green"><FileOutput size={20} /></div>
            <div className={`stat-card-change ${getChangeClass(stats.releaseChange)}`}>
              {getChangeIcon(stats.releaseChange)}
              {Math.abs(stats.releaseChange || 0)}%
            </div>
          </div>
          <div className="stat-card-value">{stats.totalReleases || 0}</div>
          <div className="stat-card-label">Total Released Footages</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Logs Overview — Action Taken from Observations - Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Observation Actions Taken</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Observation Logs</span>
          </div>
          {actionTakenData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={actionTakenData} barSize={40} margin={{ top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis dataKey="name" tick={{ fill: '#a78bcc', fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={60} axisLine={{ stroke: '#2a2045' }} />
                <YAxis tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => setSelectedBreakdown({
                    ...entry,
                    count: entry.value,
                    breakdownLabel: 'Incident Type Breakdown'
                  })}
                  style={{ cursor: 'pointer' }}
                >
                  {actionTakenData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#f0e6ff" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No observation action data available</p></div>
          )}
        </div>

        {/* Top Incident Types from Review Logs - Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Top Incident Types</span>
            <span style={{ fontSize: '10px', color: '#6b5b8a' }}>Based on Review Logs</span>
          </div>
          {incidentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  style={{ cursor: 'pointer' }}
                  onClick={(data) => setSelectedBreakdown({
                    ...data,
                    count: data.value,
                    breakdownLabel: 'Location Breakdown'
                  })}
                >
                  {incidentTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#a78bcc', paddingTop: '10px' }}
                  iconType="circle"
                  iconSize={6}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No review incident type data available</p></div>
          )}
        </div>

        {/* Top Locations */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Top Locations</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Review Logs</span>
          </div>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={locationData} layout="vertical" barSize={18} margin={{ right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis type="number" tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#a78bcc', fontSize: 11 }} width={120} axisLine={{ stroke: '#2a2045' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2a2045', opacity: 0.4 }} />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  onClick={(entry) => setSelectedBreakdown({
                    ...entry,
                    breakdownLabel: 'Purok Breakdown'
                  })}
                  style={{ cursor: 'pointer' }}
                >
                  {locationData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="right" fill="#f0e6ff" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No location data available</p></div>
          )}
        </div>

        {/* Breakdown Modal */}
        {selectedBreakdown && (
          <div className="modal-overlay" onClick={() => setSelectedBreakdown(null)} style={{ zIndex: 1000 }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: '#1a1033', border: '1px solid #3d2b63' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #2d204d' }}>
                <h3 style={{ color: '#f0e6ff' }}>{selectedBreakdown.fullName}</h3>
                <button className="modal-close" onClick={() => setSelectedBreakdown(null)} style={{ color: '#a78bcc' }}><CloseIcon size={18} /></button>
              </div>
              <div className="modal-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#a78bcc', marginBottom: '4px' }}>Total Incident Reviews</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{selectedBreakdown.count}</div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0e6ff', marginBottom: '12px', borderBottom: '1px solid #2d204d', paddingBottom: '8px' }}>
                  {selectedBreakdown.breakdownLabel || 'Data Breakdown'}
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {Object.entries(selectedBreakdown.breakdown || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '8px 12px', background: '#241a45', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#f0e6ff' }}>{type}</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#a855f7', background: '#30225c', padding: '2px 8px', borderRadius: '10px' }}>{count}</span>
                    </div>
                  ))}
                  {(!selectedBreakdown.breakdown || Object.keys(selectedBreakdown.breakdown).length === 0) && (
                    <div style={{ color: '#a78bcc', textAlign: 'center', padding: '20px' }}>No detailed breakdown available</div>
                  )}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #2d204d', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedBreakdown(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Observation Incidents Distribution (NEW) - Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Observation Incidents</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Observation Logs</span>
          </div>
          {obsIncidentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={obsIncidentData} barSize={40} margin={{ top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis dataKey="name" tick={{ fill: '#a78bcc', fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={60} axisLine={{ stroke: '#2a2045' }} />
                <YAxis tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => setSelectedBreakdown({
                    ...entry,
                    count: entry.value,
                    breakdownLabel: 'Location Breakdown'
                  })}
                  style={{ cursor: 'pointer' }}
                >
                  {obsIncidentData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#f0e6ff" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No observation incident data available</p></div>
          )}
        </div>



        {/* Incident Distribution from Review Outcomes - Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Footage Outcome</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Review Outcome</span>
          </div>
          {incidentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                  style={{ fontSize: '12px', cursor: 'pointer' }}
                  onClick={(data) => setSelectedBreakdown({
                    ...data,
                    count: data.value,
                    breakdownLabel: 'Incident Type Breakdown'
                  })}
                >
                  {incidentData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#a78bcc', paddingTop: '10px' }}
                  iconType="circle"
                  iconSize={6}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No review outcome data available</p></div>
          )}
        </div>

        {/* Multi-Agency Response from Observations (NEW) - Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Multi-Agency Response</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Observation Logs</span>
          </div>
          {multiAgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={multiAgencyData} barSize={40} margin={{ top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis dataKey="name" tick={{ fill: '#a78bcc', fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={60} axisLine={{ stroke: '#2a2045' }} />
                <YAxis tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[6, 6, 0, 0]}
                  onClick={(entry) => setSelectedBreakdown({
                    ...entry,
                    count: entry.value,
                    breakdownLabel: 'Incident Type Breakdown'
                  })}
                  style={{ cursor: 'pointer' }}
                >
                  {multiAgencyData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#f0e6ff" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No multi-agency response data available</p></div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
