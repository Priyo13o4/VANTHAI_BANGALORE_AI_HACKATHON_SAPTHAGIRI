import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TimelineIcon from '@mui/icons-material/Timeline';
import DomainIcon from '@mui/icons-material/Domain';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  MOCK_HOSPITAL_SURVEILLANCE_UPLOADS,
  MOCK_SURVEILLANCE_WEEKLY_TRENDS,
  MOCK_SURVEILLANCE_DISTRICT_STATS,
  MOCK_SURVEILLANCE_OUTBREAK_ALERTS,
} from '../constants/hospital';

export default function HospitalSurveillance() {
  const uploads = MOCK_HOSPITAL_SURVEILLANCE_UPLOADS;
  const trends = MOCK_SURVEILLANCE_WEEKLY_TRENDS.filter(t => t.disease === 'Dengue'); // Default to Dengue for chart
  const districtStats = MOCK_SURVEILLANCE_DISTRICT_STATS;
  const alerts = MOCK_SURVEILLANCE_OUTBREAK_ALERTS;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Epidemiological Surveillance
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Disease monitoring and outbreak detection across districts
      </Typography>

      {/* Outbreak Alerts */}
      <Box mb={4}>
        <Typography variant="h6" fontWeight="600" mb={2}>
          Active Outbreak Alerts
        </Typography>
        <Grid container spacing={2}>
          {alerts.map((alert) => (
            <Grid item xs={12} key={alert.id}>
              <Alert 
                severity={getSeverityColor(alert.severity) as any}
                icon={<WarningIcon />}
                variant="outlined"
                sx={{ borderRadius: 2, backgroundColor: 'white' }}
              >
                <AlertTitle sx={{ fontWeight: 'bold' }}>
                  {alert.disease} Alert - {alert.district}, {alert.state}
                </AlertTitle>
                {alert.message} — <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Week of {alert.weekStart}</Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Analytics Row */}
      <Grid container spacing={3} mb={3}>
        {/* Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon sx={{ mr: 1, color: '#0ea5e9' }} />
                <Typography variant="h6" fontWeight="600">
                  Weekly Case Trends (Dengue)
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorSuspected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="suspectedCases" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorSuspected)" 
                    name="Suspected Cases"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confirmedCases" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorConfirmed)" 
                    name="Confirmed Cases"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* District Distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DomainIcon sx={{ mr: 1, color: '#8b5cf6' }} />
                <Typography variant="h6" fontWeight="600">
                  District Distribution
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>District</TableCell>
                      <TableCell align="right">Suspected</TableCell>
                      <TableCell align="right">Confirmed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {districtStats.map((stat) => (
                      <TableRow key={stat.district}>
                        <TableCell sx={{ fontWeight: 500 }}>{stat.district}</TableCell>
                        <TableCell align="right">{stat.suspectedCases}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={stat.confirmedCases} 
                            size="small" 
                            color="error" 
                            variant="outlined" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Surveillance Reports */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <CloudUploadIcon sx={{ mr: 1, color: '#10b981' }} />
            <Typography variant="h6" fontWeight="600">
              Recent Surveillance Reports
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Disease</TableCell>
                  <TableCell align="right">Suspected</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {upload.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {upload.weekStart} to {upload.weekEnd}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={upload.disease} size="small" sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell align="right">{upload.suspectedCases}</TableCell>
                    <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                      {upload.confirmedCases}
                    </TableCell>
                    <TableCell>{upload.district}</TableCell>
                    <TableCell>
                      <Chip label="Verified" size="small" color="success" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
