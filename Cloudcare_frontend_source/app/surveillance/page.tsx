'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSnackbar } from 'notistack';
import { usePublicSurveillanceAnalytics } from '@/hooks/useHospital';
import { hospitalService } from '@/lib/api/hospital';
import { MOCK_HOSPITAL_SURVEILLANCE_UPLOADS } from '@/constants/hospital';

export default function PublicSurveillancePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [districtSearch, setDistrictSearch] = useState('');
  const [filters, setFilters] = useState({
    disease: '',
    district: '',
    startDate: '',
    endDate: '',
  });

  const { data: analytics } = usePublicSurveillanceAnalytics(filters);

  const diseaseOptions = useMemo(
    () => Array.from(new Set(MOCK_HOSPITAL_SURVEILLANCE_UPLOADS.map((item) => item.disease))),
    []
  );
  const districtOptions = useMemo(
    () => Array.from(new Set(MOCK_HOSPITAL_SURVEILLANCE_UPLOADS.map((item) => item.district))),
    []
  );

  const trendChartData = useMemo(() => {
    if (!analytics?.weeklyTrend?.length) return [];

    const grouped = analytics.weeklyTrend.reduce<Record<string, Record<string, string | number>>>(
      (acc, point) => {
        if (!acc[point.week]) {
          acc[point.week] = { week: point.week };
        }
        acc[point.week][point.disease] = point.suspectedCases;
        return acc;
      },
      {}
    );

    return Object.values(grouped).sort(
      (a, b) => new Date(String(a.week)).getTime() - new Date(String(b.week)).getTime()
    );
  }, [analytics?.weeklyTrend]);

  const diseasesInTrend = useMemo(
    () => Array.from(new Set((analytics?.weeklyTrend || []).map((item) => item.disease))),
    [analytics?.weeklyTrend]
  );

  const filteredDistrictStats = useMemo(() => {
    const rows = analytics?.districtStats || [];
    if (!districtSearch.trim()) return rows;

    const searchValue = districtSearch.toLowerCase();
    return rows.filter(
      (row) =>
        row.district.toLowerCase().includes(searchValue) ||
        row.state.toLowerCase().includes(searchValue)
    );
  }, [analytics?.districtStats, districtSearch]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadMockCsv = async () => {
    try {
      const csv = await hospitalService.getSurveillanceTemplateCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'surveillance_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      enqueueSnackbar('Mock CSV template downloaded.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to download template right now.', { variant: 'error' });
    }
  };

  const lineColors = ['#0ea5e9', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} mb={3} flexDirection={{ xs: 'column', md: 'row' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Public Disease Surveillance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aggregated disease trends and outbreak indicators
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadMockCsv}>
          Download Mock CSV
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Disease"
                value={filters.disease}
                onChange={(event) => handleFilterChange('disease', event.target.value)}
              >
                <MenuItem value="">All Diseases</MenuItem>
                {diseaseOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                select
                label="District"
                value={filters.district}
                onChange={(event) => handleFilterChange('district', event.target.value)}
              >
                <MenuItem value="">All Districts</MenuItem>
                {districtOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange('startDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange('endDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Cases
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {analytics?.totalCases || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Confirmed Rate
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {(analytics?.confirmedRate || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Affected Districts
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {analytics?.affectedDistricts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Weekly Trend by Disease (Suspected Cases)
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {diseasesInTrend.map((disease, index) => (
                    <Line
                      key={disease}
                      type="monotone"
                      dataKey={disease}
                      stroke={lineColors[index % lineColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  District-wise Cases
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search district..."
                  value={districtSearch}
                  onChange={(event) => setDistrictSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>District</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell align="right">Suspected</TableCell>
                      <TableCell align="right">Confirmed</TableCell>
                      <TableCell align="right">Confirmed %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDistrictStats.map((row) => {
                      const rate = row.suspectedCases > 0
                        ? (row.confirmedCases / row.suspectedCases) * 100
                        : 0;

                      return (
                        <TableRow key={`${row.district}-${row.state}`}>
                          <TableCell>{row.district}</TableCell>
                          <TableCell>{row.state}</TableCell>
                          <TableCell align="right">{row.suspectedCases}</TableCell>
                          <TableCell align="right">{row.confirmedCases}</TableCell>
                          <TableCell align="right">{rate.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Outbreak Alerts
              </Typography>
              {analytics?.outbreakAlerts?.length ? (
                analytics.outbreakAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    icon={<WarningAmberIcon />}
                    severity={
                      alert.severity === 'high'
                        ? 'error'
                        : alert.severity === 'medium'
                        ? 'warning'
                        : 'info'
                    }
                    sx={{ mb: 1.5 }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {alert.disease} • {alert.district}
                      </Typography>
                      <Chip size="small" label={alert.severity.toUpperCase()} />
                    </Box>
                    <Typography variant="body2">{alert.message}</Typography>
                  </Alert>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active alerts for selected filters.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
