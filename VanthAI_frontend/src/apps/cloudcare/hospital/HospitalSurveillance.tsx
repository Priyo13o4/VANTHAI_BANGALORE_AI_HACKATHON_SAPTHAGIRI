import { useMemo, useState } from 'react';
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
  Button,
  TextField,
  Collapse,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TimelineIcon from '@mui/icons-material/Timeline';
import DomainIcon from '@mui/icons-material/Domain';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
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
import {
  useCreateHospitalSurveillanceUpload,
  useHospitalSurveillanceUploads,
} from '../hooks/useHospital';

const DEMO_HOSPITAL_ID = 'HSP-001';

export default function HospitalSurveillance() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: serverUploads = [] } = useHospitalSurveillanceUploads(DEMO_HOSPITAL_ID);
  const createUploadMutation = useCreateHospitalSurveillanceUpload();

  const [showForm, setShowForm] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    weekStart: '',
    weekEnd: '',
    district: '',
    state: '',
    disease: '',
    suspectedCases: '',
    confirmedCases: '',
    ageGroup0to17: '',
    ageGroup18to49: '',
    ageGroup50Plus: '',
    maleCases: '',
    femaleCases: '',
    otherGenderCases: '',
    notes: '',
  });

  // Combine mock data with server data for display
  const uploads = useMemo(() => {
    return [...serverUploads, ...MOCK_HOSPITAL_SURVEILLANCE_UPLOADS];
  }, [serverUploads]);

  const trends = MOCK_SURVEILLANCE_WEEKLY_TRENDS.filter(t => t.disease === 'Dengue');
  const districtStats = MOCK_SURVEILLANCE_DISTRICT_STATS;
  const alerts = MOCK_SURVEILLANCE_OUTBREAK_ALERTS;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createUploadMutation.mutateAsync({
        hospitalId: DEMO_HOSPITAL_ID,
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        district: formData.district,
        state: formData.state,
        disease: formData.disease,
        suspectedCases: Number(formData.suspectedCases || 0),
        confirmedCases: Number(formData.confirmedCases || 0),
        ageGroup0to17: Number(formData.ageGroup0to17 || 0),
        ageGroup18to49: Number(formData.ageGroup18to49 || 0),
        ageGroup50Plus: Number(formData.ageGroup50Plus || 0),
        maleCases: Number(formData.maleCases || 0),
        femaleCases: Number(formData.femaleCases || 0),
        otherGenderCases: Number(formData.otherGenderCases || 0),
        notes: formData.notes,
        csvFileName: selectedFileName || undefined,
      });

      enqueueSnackbar('Surveillance report submitted successfully.', { variant: 'success' });
      setShowForm(false);
      setFormData({
        weekStart: '', weekEnd: '', district: '', state: '', disease: '',
        suspectedCases: '', confirmedCases: '', ageGroup0to17: '',
        ageGroup18to49: '', ageGroup50Plus: '', maleCases: '',
        femaleCases: '', otherGenderCases: '', notes: '',
      });
      setSelectedFileName('');
    } catch (error) {
      enqueueSnackbar('Failed to submit surveillance report.', { variant: 'error' });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Epidemiological Surveillance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Disease monitoring and outbreak detection across districts
          </Typography>
        </Box>
        <Button
          variant={showForm ? "outlined" : "contained"}
          color={showForm ? "inherit" : "primary"}
          startIcon={showForm ? <CloseIcon /> : <AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {showForm ? "Cancel" : "Submit New Report"}
        </Button>
      </Box>

      {/* Submission Form (Collapsible) */}
      <Collapse in={showForm}>
        <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'primary.light', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" mb={3} display="flex" alignItems="center" gap={1}>
              <CloudUploadIcon color="primary" /> New Epidemiological Report
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Week Start" type="date" value={formData.weekStart} onChange={(e) => handleChange('weekStart', e.target.value)} InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Week End" type="date" value={formData.weekEnd} onChange={(e) => handleChange('weekEnd', e.target.value)} InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="District" value={formData.district} onChange={(e) => handleChange('district', e.target.value)} required />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="State" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} required />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Disease" value={formData.disease} onChange={(e) => handleChange('disease', e.target.value)} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Suspected Cases" type="number" value={formData.suspectedCases} onChange={(e) => handleChange('suspectedCases', e.target.value)} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Confirmed Cases" type="number" value={formData.confirmedCases} onChange={(e) => handleChange('confirmedCases', e.target.value)} required />
                </Grid>

                {/* Age Groups */}
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Age 0-17" type="number" value={formData.ageGroup0to17} onChange={(e) => handleChange('ageGroup0to17', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Age 18-49" type="number" value={formData.ageGroup18to49} onChange={(e) => handleChange('ageGroup18to49', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Age 50+" type="number" value={formData.ageGroup50Plus} onChange={(e) => handleChange('ageGroup50Plus', e.target.value)} />
                </Grid>

                {/* Gender Breakdown */}
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Male Cases" type="number" value={formData.maleCases} onChange={(e) => handleChange('maleCases', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Female Cases" type="number" value={formData.femaleCases} onChange={(e) => handleChange('femaleCases', e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Other Gender" type="number" value={formData.otherGenderCases} onChange={(e) => handleChange('otherGenderCases', e.target.value)} />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Notes" multiline rows={2} value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
                    Upload CSV
                    <input hidden type="file" accept=".csv" onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')} />
                  </Button>
                  {selectedFileName && <Typography variant="caption" color="primary.main">Selected: {selectedFileName}</Typography>}
                  <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={createUploadMutation.isPending} sx={{ borderRadius: 2, px: 4 }}>
                    {createUploadMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

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
                  <Area type="monotone" dataKey="suspectedCases" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSuspected)" name="Suspected Cases" />
                  <Area type="monotone" dataKey="confirmedCases" stroke="#ef4444" fillOpacity={1} fill="url(#colorConfirmed)" name="Confirmed Cases" />
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
                          <Chip label={stat.confirmedCases} size="small" color="error" variant="outlined" sx={{ fontWeight: 'bold' }} />
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
                    <TableCell><Typography variant="body2" fontWeight="600">{upload.id}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{upload.weekStart} to {upload.weekEnd}</Typography></TableCell>
                    <TableCell><Chip label={upload.disease} size="small" sx={{ fontWeight: 500 }} /></TableCell>
                    <TableCell align="right">{upload.suspectedCases}</TableCell>
                    <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 'bold' }}>{upload.confirmedCases}</TableCell>
                    <TableCell>{upload.district}</TableCell>
                    <TableCell><Chip label="Verified" size="small" color="success" /></TableCell>
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
