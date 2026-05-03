import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import useStore from '../../store/useStore';

// ── Generate realistic mock weekly data ──
function genWeekData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    heartRate:   68 + Math.floor(Math.random() * 14),
    systolic:    112 + Math.floor(Math.random() * 12),
    diastolic:   72  + Math.floor(Math.random() * 8),
    spo2:        97  + Math.floor(Math.random() * 3),
    steps:       5500 + Math.floor(Math.random() * 5000),
    calories:    260  + Math.floor(Math.random() * 180),
    sleep:       +(5.5 + Math.random() * 2.5).toFixed(1),
    weight:      +(65.5 + (Math.random() - 0.5) * 1.2).toFixed(1),
    glucose:     95   + Math.floor(Math.random() * 25),
    stress:      20   + Math.floor(Math.random() * 40),
  }));
}

function genMonthData() {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map(week => ({
    week,
    avgHR:     70 + Math.floor(Math.random() * 10),
    avgBP:     116 + Math.floor(Math.random() * 8),
    avgSteps:  6000 + Math.floor(Math.random() * 3000),
    avgSleep:  +(6 + Math.random() * 1.5).toFixed(1),
    avgGlucose:98 + Math.floor(Math.random() * 20),
  }));
}

const WEEK  = genWeekData();
const MONTH = genMonthData();

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value}{unit || ''}
        </div>
      ))}
    </div>
  );
};

// ── Stat summary card ──
function SummaryCard({ icon, label, value, unit, sub, color, trend }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{icon} {label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: -1 }}>{value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 3 }}>{unit}</span></div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--coral)' : 'var(--text3)', background: trend > 0 ? 'rgba(82,214,122,.1)' : trend < 0 ? 'rgba(255,107,107,.1)' : 'var(--bg3)', padding: '4px 9px', borderRadius: 100 }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderRadius: '50%', background: color, opacity: .06, transform: 'translate(15px,15px)' }} />
    </div>
  );
}

// ── Chart wrapper ──
function ChartCard({ title, subtitle, children, height = 200 }) {
  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { liveVitals } = useStore();
  const [range, setRange] = useState('week');
  const data = range === 'week' ? WEEK : MONTH;
  const xKey = range === 'week' ? 'day' : 'week';

  // Averages this week
  const avgHR    = Math.round(WEEK.reduce((s, d) => s + d.heartRate, 0) / WEEK.length);
  const avgSys   = Math.round(WEEK.reduce((s, d) => s + d.systolic, 0) / WEEK.length);
  const avgDia   = Math.round(WEEK.reduce((s, d) => s + d.diastolic, 0) / WEEK.length);
  const avgSteps = Math.round(WEEK.reduce((s, d) => s + d.steps, 0) / WEEK.length);
  const avgSleep = (WEEK.reduce((s, d) => s + d.sleep, 0) / WEEK.length).toFixed(1);
  const avgGluc  = Math.round(WEEK.reduce((s, d) => s + d.glucose, 0) / WEEK.length);

  const axisStyle = { fill: 'var(--text3)', fontSize: 11 };
  const gridStyle = { stroke: 'var(--border)', strokeDasharray: '3 3' };

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>Health <em>Analytics</em></h1>
        <p>Visual trends of your vitals · Weekly and monthly insights</p>
      </div>

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {['week', 'month'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '8px 20px', borderRadius: 100, border: `1px solid ${range === r ? 'var(--mint)' : 'var(--border)'}`,
            background: range === r ? 'var(--mintd)' : 'var(--card)',
            color: range === r ? 'var(--mint)' : 'var(--text2)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all .2s',
          }}>{r === 'week' ? 'This Week' : 'This Month'}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mint)', animation: 'pulse 2s infinite' }} />
          Live: {liveVitals.heartRate} bpm
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        <SummaryCard icon="❤️" label="Avg Heart Rate" value={avgHR} unit="bpm" sub="This week" color="var(--coral)" trend={2} />
        <SummaryCard icon="📊" label="Avg Blood Pressure" value={`${avgSys}/${avgDia}`} unit="" sub="mmHg" color="var(--blue)" trend={-1} />
        <SummaryCard icon="🫁" label="Avg SpO2" value="98.4" unit="%" sub="Excellent" color="var(--mint)" trend={0} />
        <SummaryCard icon="🚶" label="Avg Steps" value={avgSteps.toLocaleString()} unit="" sub="/ 10,000 goal" color="var(--amber)" trend={8} />
        <SummaryCard icon="😴" label="Avg Sleep" value={avgSleep} unit="hrs" sub="Recommended: 8h" color="var(--purple)" trend={-5} />
        <SummaryCard icon="🩸" label="Avg Glucose" value={avgGluc} unit="mg/dL" sub="Fasting" color="var(--green)" trend={3} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="❤️ Heart Rate" subtitle="bpm over time" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey={xKey} tick={axisStyle} />
              <YAxis tick={axisStyle} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip unit=" bpm" />} />
              <Area type="monotone" dataKey={range === 'week' ? 'heartRate' : 'avgHR'} name="Heart Rate"
                stroke="#FF6B6B" strokeWidth={2} fill="url(#hrGrad)" dot={{ fill: '#FF6B6B', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📊 Blood Pressure" subtitle="systolic / diastolic mmHg" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[60, 140]} />
              <Tooltip content={<CustomTooltip unit=" mmHg" />} />
              <Line type="monotone" dataKey="systolic"  name="Systolic"  stroke="#4A9FD5" strokeWidth={2} dot={{ fill: '#4A9FD5', r: 3 }} />
              <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9B82F4" strokeWidth={2} dot={{ fill: '#9B82F4', r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="🚶 Daily Steps" subtitle="vs 10,000 goal" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit=" steps" />} />
              <Bar dataKey="steps" name="Steps" fill="var(--amber)" radius={[4, 4, 0, 0]}
                label={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="😴 Sleep Duration" subtitle="hours per night" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B82F4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9B82F4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[4, 9]} />
              <Tooltip content={<CustomTooltip unit=" hrs" />} />
              <Area type="monotone" dataKey="sleep" name="Sleep"
                stroke="#9B82F4" strokeWidth={2} fill="url(#sleepGrad)" dot={{ fill: '#9B82F4', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🩸 Blood Glucose" subtitle="mg/dL fasting" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[80, 140]} />
              <Tooltip content={<CustomTooltip unit=" mg/dL" />} />
              {/* Normal range band */}
              <Line type="monotone" dataKey="glucose" name="Glucose"
                stroke="#52D67A" strokeWidth={2} dot={{ fill: '#52D67A', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <ChartCard title="🔥 Calories Burned" subtitle="daily activity calories" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip unit=" kcal" />} />
              <Bar dataKey="calories" name="Calories" radius={[4, 4, 0, 0]}>
                {WEEK.map((_, i) => (
                  <rect key={i} fill={`hsl(${160 + i * 10}, 70%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🧘 Stress Level" subtitle="estimated from HRV" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEK} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFAA44" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFAA44" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="day" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Area type="monotone" dataKey="stress" name="Stress"
                stroke="#FFAA44" strokeWidth={2} fill="url(#stressGrad)" dot={{ fill: '#FFAA44', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Health Score */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>🏆 Overall Health Score</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18, lineHeight: 1.6 }}>
              Based on your heart rate, blood pressure, activity, sleep, and glucose trends this week.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Heart Health',  score: 88, color: 'var(--coral)' },
                { label: 'Activity',      score: 72, color: 'var(--amber)' },
                { label: 'Sleep Quality', score: 65, color: 'var(--purple)' },
                { label: 'Blood Sugar',   score: 80, color: 'var(--green)' },
                { label: 'SpO2 / Oxygen', score: 95, color: 'var(--mint)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 110, fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{item.label}</div>
                  <div style={{ flex: 1, height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ width: 32, fontSize: 12, fontWeight: 600, color: item.color, textAlign: 'right' }}>{item.score}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="65" fill="none" stroke="var(--border)" strokeWidth="12" />
                <circle cx="80" cy="80" r="65" fill="none" stroke="url(#scoreGrad)" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 65}`}
                  strokeDashoffset={`${2 * Math.PI * 65 * (1 - 0.80)}`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D4A8" />
                    <stop offset="100%" stopColor="#4A9FD5" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: 'var(--mint)', lineHeight: 1 }}>80</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>/ 100</div>
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mint)', marginTop: 8 }}>Good Health</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, textAlign: 'center' }}>
              Sleep quality needs improvement.<br />Activity is on track this week.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
