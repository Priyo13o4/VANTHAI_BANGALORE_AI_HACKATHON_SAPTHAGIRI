'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import {
  useCreateHospitalSurveillanceUpload,
  useHospitalSurveillanceUploads,
} from '@/hooks/useHospital';

const DEMO_HOSPITAL_ID = 'HSP-001';

export default function HospitalSurveillancePage() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: records = [] } = useHospitalSurveillanceUploads(DEMO_HOSPITAL_ID);
  const createUploadMutation = useCreateHospitalSurveillanceUpload();

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
  const [selectedFileName, setSelectedFileName] = useState('');

  const kpis = useMemo(() => {
    const totalSubmissions = records.length;
    const totalSuspectedCases = records.reduce((sum, item) => sum + item.suspectedCases, 0);
    const totalConfirmedCases = records.reduce((sum, item) => sum + item.confirmedCases, 0);

    return { totalSubmissions, totalSuspectedCases, totalConfirmedCases };
  }, [records]);

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

      enqueueSnackbar('Surveillance report submitted successfully.', {
        variant: 'success',
      });

      setFormData({
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
      setSelectedFileName('');
    } catch {
      enqueueSnackbar('Unable to submit report. Please try again.', {
        variant: 'error',
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Disease Surveillance Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Weekly disease surveillance submissions for hospital ID {DEMO_HOSPITAL_ID}
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Submissions
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {kpis.totalSubmissions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Suspected Cases
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {kpis.totalSuspectedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Confirmed Cases
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {kpis.totalConfirmedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Upload Weekly Report
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Week Start"
                      type="date"
                      value={formData.weekStart}
                      onChange={(event) => handleChange('weekStart', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Week End"
                      type="date"
                      value={formData.weekEnd}
                      onChange={(event) => handleChange('weekEnd', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="District"
                      value={formData.district}
                      onChange={(event) => handleChange('district', event.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={formData.state}
                      onChange={(event) => handleChange('state', event.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Disease"
                      value={formData.disease}
                      onChange={(event) => handleChange('disease', event.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Suspected Cases"
                      type="number"
                      value={formData.suspectedCases}
                      onChange={(event) => handleChange('suspectedCases', event.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Confirmed Cases"
                      type="number"
                      value={formData.confirmedCases}
                      onChange={(event) => handleChange('confirmedCases', event.target.value)}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Age 0-17"
                      type="number"
                      value={formData.ageGroup0to17}
                      onChange={(event) => handleChange('ageGroup0to17', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Age 18-49"
                      type="number"
                      value={formData.ageGroup18to49}
                      onChange={(event) => handleChange('ageGroup18to49', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Age 50+"
                      type="number"
                      value={formData.ageGroup50Plus}
                      onChange={(event) => handleChange('ageGroup50Plus', event.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Male Cases"
                      type="number"
                      value={formData.maleCases}
                      onChange={(event) => handleChange('maleCases', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Female Cases"
                      type="number"
                      value={formData.femaleCases}
                      onChange={(event) => handleChange('femaleCases', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Other Gender Cases"
                      type="number"
                      value={formData.otherGenderCases}
                      onChange={(event) => handleChange('otherGenderCases', event.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(event) => handleChange('notes', event.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadFileIcon />}
                    >
                      Upload Mock CSV
                      <input
                        hidden
                        type="file"
                        accept=".csv"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          setSelectedFileName(file ? file.name : '');
                        }}
                      />
                    </Button>
                    {selectedFileName && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Selected file: {selectedFileName}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SendIcon />}
                      disabled={createUploadMutation.isPending}
                      sx={{
                        background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7, #0891b2)',
                        },
                      }}
                    >
                      {createUploadMutation.isPending ? 'Submitting...' : 'Submit Surveillance Report'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            My Hospital Submissions
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Submitted At</TableCell>
                  <TableCell>Week Range</TableCell>
                  <TableCell>Disease</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell align="right">Suspected</TableCell>
                  <TableCell align="right">Confirmed</TableCell>
                  <TableCell>CSV</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {record.weekStart} to {record.weekEnd}
                    </TableCell>
                    <TableCell>{record.disease}</TableCell>
                    <TableCell>{record.district}</TableCell>
                    <TableCell align="right">{record.suspectedCases}</TableCell>
                    <TableCell align="right">{record.confirmedCases}</TableCell>
                    <TableCell>{record.csvFileName || '-'}</TableCell>
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
