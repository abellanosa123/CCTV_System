import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { Eye, FileSearch, FileOutput, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1530',
        border: '1px solid #2a2045',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#f0e6ff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label || payload[0].name}</p>
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats({ filter });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

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

  // Incident Distribution from Release Footage
  const incidentData = (data?.incidentDistribution || []).map((item, i) => ({
    name: item.type,
    value: item.count,
    fill: COLORS[i % COLORS.length]
  }));

  // Logs Overview — Action Taken counts from Observations
  const actionTakenData = (data?.actionTakenOverview || []).map((item, i) => ({
    name: item.action,
    value: item.count,
    fill: COLORS[i % COLORS.length]
  }));

  // Top Locations
  const locationData = (data?.topLocations || []).slice(0, 6).map((item) => ({
    name: item.location?.length > 20 ? item.location.slice(0, 18) + '...' : item.location,
    count: item.count
  }));

  // Top Incident Types from Review Logs
  const incidentTypeData = (data?.topIncidentTypes || []).slice(0, 6).map((item, i) => ({
    name: item.type,
    value: item.count,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Dashboard</h2>
          <p>Real-time CCTV monitoring overview</p>
        </div>
        <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

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
        {/* Incident Distribution from Review Outcomes - Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Incident Distribution</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Review Outcome</span>
          </div>
          {incidentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  style={{ fontSize: '10px' }}
                >
                  {incidentData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No review outcome data available</p></div>
          )}
        </div>

        {/* Logs Overview — Action Taken from Observations - Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Observation Actions Overview</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Observation Logs</span>
          </div>
          {actionTakenData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={actionTakenData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis dataKey="name" tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} />
                <YAxis tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {actionTakenData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No observation action data available</p></div>
          )}
        </div>

        {/* Top Locations */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Top Locations</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Review Logs</span>
          </div>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2045" />
                <XAxis type="number" tick={{ fill: '#a78bcc', fontSize: 12 }} axisLine={{ stroke: '#2a2045' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#a78bcc', fontSize: 11 }} width={120} axisLine={{ stroke: '#2a2045' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No location data available</p></div>
          )}
        </div>

        {/* Top Incident Types from Review Logs - Pie Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <span className="chart-card-title">Top Incident Types</span>
            <span style={{ fontSize: '11px', color: '#6b5b8a' }}>Based on Review Logs</span>
          </div>
          {incidentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {incidentTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#a78bcc' }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No review incident type data available</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
