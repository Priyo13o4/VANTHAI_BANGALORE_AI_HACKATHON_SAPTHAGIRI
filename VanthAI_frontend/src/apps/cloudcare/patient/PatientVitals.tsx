import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Skeleton,
  Paper,
  AlertColor,
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Air as OxygenIcon,
  MonitorHeart as MonitorIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  WatchLater as WatchIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate } from '../data/formatters';

const COLORS = {
  heartRate: '#dc004e',
  oxygen: '#2e7d32',
  temperature: '#f57c00',
  steps: '#1976d2',
};

const PIE_COLORS = ['#1976d2', '#2e7d32', '#f57c00', '#dc004e'];

type WearableSnapshot = {
  timestamp: string;
  heartRate: number;
  oxygenLevel: number;
  temperature: number;
  steps: number;
};

type WearableHistoryPoint = WearableSnapshot;

type HeartRateStatus = {
  status: string;
  color: 'warning' | 'error' | 'success';
  severity: AlertColor;
};

type OxygenStatus = {
  status: string;
  color: 'error' | 'success' | 'default';
  severity: AlertColor;
};

const MOCK_LATEST_METRICS: WearableSnapshot = {
  timestamp: '2025-10-19T10:30:00Z',
  heartRate: 88,
  oxygenLevel: 96,
  temperature: 98.6,
  steps: 6485,
};

const MOCK_HISTORY: WearableHistoryPoint[] = [
  { timestamp: '2025-10-19T06:00:00Z', heartRate: 74, oxygenLevel: 98, temperature: 98.1, steps: 1450 },
  { timestamp: '2025-10-19T07:00:00Z', heartRate: 78, oxygenLevel: 97, temperature: 98.2, steps: 2100 },
  { timestamp: '2025-10-19T08:00:00Z', heartRate: 82, oxygenLevel: 97, temperature: 98.3, steps: 2740 },
  { timestamp: '2025-10-19T09:00:00Z', heartRate: 86, oxygenLevel: 96, temperature: 98.5, steps: 4100 },
  { timestamp: '2025-10-19T09:30:00Z', heartRate: 90, oxygenLevel: 96, temperature: 98.4, steps: 5120 },
  { timestamp: '2025-10-19T10:00:00Z', heartRate: 92, oxygenLevel: 95, temperature: 98.7, steps: 5980 },
  { timestamp: '2025-10-19T10:15:00Z', heartRate: 89, oxygenLevel: 96, temperature: 98.6, steps: 6205 },
  { timestamp: '2025-10-19T10:30:00Z', heartRate: 88, oxygenLevel: 96, temperature: 98.6, steps: 6485 },
  { timestamp: '2025-10-19T10:45:00Z', heartRate: 87, oxygenLevel: 95, temperature: 98.5, steps: 6710 },
  { timestamp: '2025-10-19T11:00:00Z', heartRate: 85, oxygenLevel: 96, temperature: 98.4, steps: 6890 },
  { timestamp: '2025-10-19T11:15:00Z', heartRate: 83, oxygenLevel: 97, temperature: 98.3, steps: 7025 },
  { timestamp: '2025-10-19T11:30:00Z', heartRate: 84, oxygenLevel: 97, temperature: 98.3, steps: 7240 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const jitter = (value: number, delta: number) => {
  const offset = (Math.random() * 2 - 1) * delta;
  return value + offset;
};

export default function PatientVitals() {
  const [latestData, setLatestData] = useState<WearableSnapshot | null>(null);
  const [historicalData, setHistoricalData] = useState<WearableHistoryPoint[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLatestData(MOCK_LATEST_METRICS);
      setHistoricalData(MOCK_HISTORY);
      setLoadingLatest(false);
      setLoadingHistory(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setLatestData((prev) => {
        const baseline = prev ?? MOCK_LATEST_METRICS;
        const updated: WearableSnapshot = {
          timestamp: new Date().toISOString(),
          heartRate: Math.round(clamp(jitter(baseline.heartRate, 6), 58, 120)),
          oxygenLevel: Math.round(clamp(jitter(baseline.oxygenLevel, 1.5), 92, 100)),
          temperature: parseFloat(clamp(jitter(baseline.temperature, 0.3), 97.2, 100.2).toFixed(1)),
          steps: Math.round(clamp(baseline.steps + Math.random() * 450 + 120, 0, 15000)),
        };
        return updated;
      });

      setHistoricalData((prev) => {
        const reference = prev.length > 0 ? prev[prev.length - 1] : MOCK_LATEST_METRICS;
        const nextPoint: WearableHistoryPoint = {
          timestamp: new Date().toISOString(),
          heartRate: Math.round(clamp(jitter(reference.heartRate, 5), 58, 120)),
          oxygenLevel: Math.round(clamp(jitter(reference.oxygenLevel, 1.2), 92, 100)),
          temperature: parseFloat(clamp(jitter(reference.temperature, 0.25), 97.0, 100.2).toFixed(1)),
          steps: Math.round(clamp(reference.steps + Math.random() * 320 + 75, 0, 15000)),
        };

        return [...prev.slice(-23), nextPoint];
      });

      setLoadingLatest(false);
      setLoadingHistory(false);
      setSyncing(false);
    }, 700);
  };

  // Get health status
  const getHeartRateStatus = (hr: number): HeartRateStatus => {
    if (hr < 60) return { status: 'Low', color: 'warning', severity: 'warning' };
    if (hr > 100) return { status: 'High', color: 'error', severity: 'error' };
    return { status: 'Normal', color: 'success', severity: 'success' };
  };

  const getOxygenStatus = (o2: number): OxygenStatus => {
    if (o2 < 95) return { status: 'Low', color: 'error', severity: 'error' };
    if (o2 >= 95 && o2 <= 100) return { status: 'Normal', color: 'success', severity: 'success' };
    return { status: 'Unknown', color: 'default', severity: 'info' };
  };

  const chartData = useMemo(() => {
    return historicalData.slice(-20).map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      heartRate: reading.heartRate,
      oxygen: reading.oxygenLevel,
      timestamp: reading.timestamp,
    }));
  }, [historicalData]);

  const pieData = useMemo(
    () =>
      latestData
        ? [
          { name: 'Heart Rate', value: latestData.heartRate },
          { name: 'Oxygen Level', value: latestData.oxygenLevel },
          { name: 'Temperature', value: Math.round(latestData.temperature * 10) },
          { name: 'Steps (100s)', value: Math.round(latestData.steps / 100) },
        ]
        : [],
    [latestData]
  );

  const calculateTrend = (
    data: Array<{ heartRate?: number | null; oxygen?: number | null }>,
    key: 'heartRate' | 'oxygen'
  ) => {
    if (data.length < 2) return null;
    const recent = data.slice(-5);
    const prev = data.slice(-10, -5);
    if (recent.length === 0 || prev.length === 0) return null;

    const avg = recent.reduce((sum, entry) => sum + (entry[key] ?? 0), 0) / recent.length;
    const prevAvg = prev.reduce((sum, entry) => sum + (entry[key] ?? 0), 0) / prev.length;

    if (avg > prevAvg + 0.5) return 'up' as const;
    if (avg < prevAvg - 0.5) return 'down' as const;
    return 'stable' as const;
  };

  const hrTrend = useMemo(() => calculateTrend(chartData, 'heartRate'), [chartData]);
  const o2Trend = useMemo(() => calculateTrend(chartData, 'oxygen'), [chartData]);

  const heartStatus = latestData?.heartRate ? getHeartRateStatus(latestData.heartRate) : null;
  const oxygenStatus = latestData?.oxygenLevel ? getOxygenStatus(latestData.oxygenLevel) : null;
  const heartStatusLabel = heartStatus?.status ?? 'Normal';

  return (
    <Box sx={{ pb: 4 }}>
      {/* 1. Header & Sync Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h5" fontWeight="700" color="text.primary">
            Health Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time vitals and historical trends from your connected devices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={syncing ? <SyncIcon className="animate-spin" /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncing}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            height: 48,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </Box>

      {/* 2. Health Alerts */}
      {latestData && (
        <Box sx={{ mb: 4 }}>
          {(latestData.heartRate < 60 || latestData.heartRate > 100) && (
            <Alert severity={heartStatus?.severity ?? 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
              <AlertTitle>Heart Rate Alert</AlertTitle>
              Your heart rate is {heartStatusLabel.toLowerCase()} at {latestData.heartRate} BPM.
            </Alert>
          )}
          {latestData.oxygenLevel < 95 && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <AlertTitle>Low Oxygen Level</AlertTitle>
              Your oxygen saturation is at {latestData.oxygenLevel}%. Normal range is 95-100%.
            </Alert>
          )}
        </Box>
      )}

      {/* 3. Consolidated Overview Row (Rebalanced 5 Cards) */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Heart Rate */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2 }}>
              {loadingLatest ? <Skeleton variant="rectangular" height={80} /> : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <HeartIcon sx={{ fontSize: 28, color: COLORS.heartRate }} />
                    <Chip 
                      label={heartStatus?.status ?? 'Normal'} 
                      color={heartStatus?.color ?? 'success'} 
                      size="small" 
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="700">{latestData?.heartRate || '--'}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Heart Rate
                    {hrTrend === 'up' && <TrendingUpIcon sx={{ fontSize: 12 }} color="error" />}
                    {hrTrend === 'down' && <TrendingDownIcon sx={{ fontSize: 12 }} color="success" />}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Oxygen */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2 }}>
              {loadingLatest ? <Skeleton variant="rectangular" height={80} /> : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <OxygenIcon sx={{ fontSize: 28, color: COLORS.oxygen }} />
                    <Chip 
                      label={oxygenStatus?.status ?? 'Normal'} 
                      color={oxygenStatus?.color ?? 'success'} 
                      size="small" 
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="700">{latestData?.oxygenLevel || '--'}%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Oxygen
                    {o2Trend === 'up' && <TrendingUpIcon sx={{ fontSize: 12 }} color="success" />}
                    {o2Trend === 'down' && <TrendingDownIcon sx={{ fontSize: 12 }} color="error" />}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2 }}>
              {loadingLatest ? <Skeleton variant="rectangular" height={80} /> : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <MonitorIcon sx={{ fontSize: 28, color: COLORS.temperature }} />
                    <Chip 
                      label="Normal" 
                      color="success" 
                      size="small" 
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="700">{latestData?.temperature?.toFixed(1) || '--'}°F</Typography>
                  <Typography variant="caption" color="text.secondary">Body Temp</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Steps */}
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2 }}>
              {loadingLatest ? <Skeleton variant="rectangular" height={80} /> : (
                <>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <WatchIcon sx={{ fontSize: 28, color: COLORS.steps }} />
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small" 
                      sx={{ fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="700">{latestData?.steps.toLocaleString() || '--'}</Typography>
                  <Typography variant="caption" color="text.secondary">Daily Steps</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Distribution (Expanded) */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="700">Metrics Overview</Typography>
                <Typography variant="caption" color="text.secondary" display="block">Vitals Distribution</Typography>
              </Box>
              <Box sx={{ width: 100, height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={38}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* 4. Heart Rate Historical Chart (Full Width) */}
      <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>Heart Rate Historical Trend</Typography>
          <Box sx={{ height: 350, mt: 2 }}>
            {loadingHistory ? <Skeleton variant="rectangular" height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis domain={[50, 120]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke={COLORS.heartRate} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: COLORS.heartRate, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 5. Oxygen Historical Chart (Full Width) */}
      <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>Oxygen Saturation Historical Trend</Typography>
          <Box sx={{ height: 350, mt: 2 }}>
            {loadingHistory ? <Skeleton variant="rectangular" height="100%" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oxygen" 
                    stroke={COLORS.oxygen} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: COLORS.oxygen, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 7. Connected Devices */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>Connected Devices</Typography>
      <Grid container spacing={2}>
        {['Smartwatch Pro', 'Blood Pressure Monitor', 'Fitness Band'].map((device, i) => (
          <Grid item xs={12} sm={4} key={device}>
            <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', opacity: i === 2 ? 0.6 : 1 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" fontWeight="600">{device}</Typography>
                <CheckIcon size="small" color={i === 2 ? 'disabled' : 'success'} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {i === 2 ? 'Last seen 2 days ago' : 'Connected & Syncing'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
