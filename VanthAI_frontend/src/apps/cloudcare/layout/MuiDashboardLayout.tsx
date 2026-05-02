import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EventIcon from '@mui/icons-material/Event';
import MedicationIcon from '@mui/icons-material/Medication';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import VanthAIChatWidget from '../../../components/chat/VanthAIChatWidget';
import SpotlightOverlay from '../../../components/guidance/SpotlightOverlay';
import { useSpotlight } from '../../../hooks/useSpotlight';

const drawerWidth = 280;

const patientMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cloudcare/patient' },
  { text: 'Wearables & Sensors', icon: <MonitorHeartIcon />, path: '/cloudcare/patient/wearables' },
  { text: 'Appointments', icon: <EventIcon />, path: '/cloudcare/patient/appointments' },
  { text: 'Prescriptions', icon: <MedicationIcon />, path: '/cloudcare/patient/prescriptions' },
  { text: 'Profile & Family', icon: <PersonIcon />, path: '/cloudcare/patient/profile' },
  { text: 'Medical Records', icon: <DescriptionIcon />, path: '/cloudcare/patient/records' },
];

const doctorMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cloudcare/doctor' },
  { text: 'My Patients', icon: <PersonIcon />, path: '/cloudcare/doctor/patients' },
  { text: 'Schedule', icon: <EventIcon />, path: '/cloudcare/doctor/schedule' },
  { text: 'Profile', icon: <PersonIcon />, path: '/cloudcare/doctor/profile' },
];

const hospitalMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/cloudcare/hospital' },
  { text: 'Staff', icon: <PersonIcon />, path: '/cloudcare/hospital/staff' },
  { text: 'Resources', icon: <MedicationIcon />, path: '/cloudcare/hospital/resources' },
  { text: 'Surveillance', icon: <DescriptionIcon />, path: '/cloudcare/hospital/surveillance' },
];

export default function MuiDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userInitial, setUserInitial] = useState('U');

  const role = pathname.includes('/doctor') ? 'doctor' : pathname.includes('/hospital') ? 'hospital' : 'patient';
  const menuItems = role === 'doctor' ? doctorMenuItems : role === 'hospital' ? hospitalMenuItems : patientMenuItems;
  const layoutTitle = role === 'doctor' ? 'Doctor Portal' : role === 'hospital' ? 'Hospital Admin' : 'Patient Dashboard';

  const { startTour } = useSpotlight('cloudcare');

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('userEmail');
    if (storedEmail && storedEmail[0]) {
      setUserInitial(storedEmail[0].toUpperCase());
    }
  }, []);



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('patientId');
    window.localStorage.removeItem('userEmail');
    window.localStorage.removeItem('wearableToken');
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            CloudCare
          </Typography>
          <Typography variant="caption">{layoutTitle}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
            <ListItemButton
              selected={pathname === item.path || (pathname === '/cloudcare' && item.path === '/cloudcare/patient')}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: (pathname === item.path || (pathname === '/cloudcare' && item.path === '/cloudcare/patient')) ? 'white' : 'action.active',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: (pathname === item.path || (pathname === '/cloudcare' && item.path === '/cloudcare/patient')) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
      <List sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === pathname)?.text || 'Dashboard'}
          </Typography>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {userInitial}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { handleNavigation('/cloudcare/patient/profile'); handleProfileMenuClose(); }}>
              <PersonIcon sx={{ mr: 2 }} /> My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: ['64px', '64px', '64px'],
        }}
      >
        <Outlet />
      </Box>
      
      {/* VanthAI Spotlight Guidance Overlay */}
      <SpotlightOverlay />

      {/* Chat Widget specifically for CloudCare */}
      <VanthAIChatWidget app="cloudcare" />
    </Box>
  );
}
