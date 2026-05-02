import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function HospitalLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@citygeneral.com', password: 'test123' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem('authToken', 'demo_token_' + Date.now());
      localStorage.setItem('hospitalId', '1');
      localStorage.setItem('userEmail', data.email);
      navigate('/cloudcare/hospital');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>Hospital Admin</Typography>
            <Typography variant="body2" color="text.secondary">Secure access for hospital administration</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Demo Credentials:</Typography>
            <Typography variant="caption">Email: admin@citygeneral.com | Password: test123</Typography>
          </Alert>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField fullWidth label="Admin Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> } }} sx={{ mb: 3 }} disabled={loading} />
            <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} {...register('password')} error={!!errors.password} helperText={errors.password?.message} slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>, endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> ) } }} sx={{ mb: 3 }} disabled={loading} />
            <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={loading} sx={{ mb: 2, py: 1.5 }}>
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </Button>
          </form>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => navigate('/cloudcare/login')} disabled={loading}>Patient Login</Button>
            <Button variant="outlined" fullWidth onClick={() => navigate('/cloudcare/doctor-login')} disabled={loading}>Doctor Login</Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
