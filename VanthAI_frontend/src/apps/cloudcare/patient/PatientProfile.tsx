import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  FamilyRestroom as FamilyIcon,
} from '@mui/icons-material';
import { 
  FALLBACK_PATIENT_ID, 
  getPatientById, 
  getPatientFamilyContacts,
  PatientSnapshot,
  FamilyContact 
} from '../data/mockData';

export default function PatientProfile() {
  const [patient, setPatient] = useState<PatientSnapshot | null>(null);
  const [familyContacts, setFamilyContacts] = useState<FamilyContact[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<PatientSnapshot>>({});
  const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
  const [newFamilyContact, setNewFamilyContact] = useState({
    name: '',
    relationship: '',
    contact: '',
    isEmergencyContact: false,
  });

  useEffect(() => {
    const data = getPatientById(FALLBACK_PATIENT_ID);
    if (data) {
      setPatient(data);
      setEditedPatient(data);
      const contacts = getPatientFamilyContacts(FALLBACK_PATIENT_ID);
      setFamilyContacts(contacts);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedPatient) {
      setPatient(editedPatient as PatientSnapshot);
      // In a real app, we would save to backend here
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPatient(patient || {});
    setIsEditing(false);
  };

  const handleAddFamily = () => {
    const newContact: FamilyContact = {
      id: familyContacts.length + 1,
      patientId: patient?.id || FALLBACK_PATIENT_ID,
      name: newFamilyContact.name,
      relationship: newFamilyContact.relationship,
      contact: newFamilyContact.contact,
      isPrimary: false,
      isEmergencyContact: newFamilyContact.isEmergencyContact,
    };

    setFamilyContacts([...familyContacts, newContact]);
    setOpenFamilyDialog(false);
    setNewFamilyContact({
      name: '',
      relationship: '',
      contact: '',
      isEmergencyContact: false,
    });
  };

  const handleDeleteFamily = (id: number) => {
    setFamilyContacts(familyContacts.filter((contact) => contact.id !== id));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!patient) return null;

  return (
    <Box data-vanthai-id="cloudcare-patient-profile-root">
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            My Profile & Family
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your personal information and family contacts
          </Typography>
        </Grid>

        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }} data-vanthai-id="cloudcare-profile-card">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    data-vanthai-id="cloudcare-profile-edit-btn"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      data-vanthai-id="cloudcare-profile-save-btn"
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Avatar */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                  }}
                >
                  {getInitials(patient.name)}
                </Avatar>
              </Box>

              {/* Form Fields */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={isEditing ? editedPatient.name : patient.name}
                    onChange={(e) =>
                      setEditedPatient({ ...editedPatient, name: e.target.value })
                    }
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    data-vanthai-id="cloudcare-profile-field-name"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    name="age"
                    type="number"
                    value={isEditing ? editedPatient.age : patient.age}
                    onChange={(e) =>
                      setEditedPatient({ ...editedPatient, age: parseInt(e.target.value) })
                    }
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    data-vanthai-id="cloudcare-profile-field-age"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={isEditing ? editedPatient.gender : patient.gender}
                    onChange={(e) =>
                      setEditedPatient({ ...editedPatient, gender: e.target.value })
                    }
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <GenderIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    data-vanthai-id="cloudcare-profile-field-gender"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contact"
                    value={isEditing ? editedPatient.contact : patient.contact}
                    onChange={(e) =>
                      setEditedPatient({ ...editedPatient, contact: e.target.value })
                    }
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    data-vanthai-id="cloudcare-profile-field-contact"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={2}
                    value={isEditing ? editedPatient.address : patient.address}
                    onChange={(e) =>
                      setEditedPatient({ ...editedPatient, address: e.target.value })
                    }
                    disabled={!isEditing}
                    data-vanthai-id="cloudcare-profile-field-address"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Status Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: patient.emergency ? 'error.lighter' : 'success.lighter', height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <WarningIcon
                  sx={{
                    fontSize: 64,
                    color: patient.emergency ? 'error.main' : 'success.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Emergency Status
                </Typography>
                <Chip
                  label={patient.emergency ? 'ACTIVE' : 'INACTIVE'}
                  color={patient.emergency ? 'error' : 'success'}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {patient.emergency
                    ? 'Your account is flagged for priority medical attention'
                    : 'No emergency flag currently active'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Family & Emergency Contacts */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }} data-vanthai-id="cloudcare-family-contacts-card">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FamilyIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Family & Emergency Contacts
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenFamilyDialog(true)}
                  size="small"
                  data-vanthai-id="cloudcare-family-add-btn"
                >
                  Add Contact
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {familyContacts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <FamilyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No family contacts added yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {familyContacts.map((contact) => (
                    <ListItem
                      key={contact.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                      }}
                      data-vanthai-id={`cloudcare-family-item-${contact.id}`}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(contact.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {contact.name}
                            </Typography>
                            {contact.isPrimary && (
                              <Chip label="Primary" size="small" color="primary" />
                            )}
                            {contact.isEmergencyContact && (
                              <Chip
                                label="Emergency"
                                size="small"
                                color="error"
                                icon={<StarIcon />}
                              />
                            )}
                          </Box>
                        }
                        secondary={`${contact.relationship} • ${contact.contact}`}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          sx: { mt: 0.5 }
                        }}
                      />
                      <ListItemSecondaryAction>
                        {!contact.isPrimary && (
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteFamily(contact.id)}
                            color="error"
                            data-vanthai-id={`cloudcare-family-delete-${contact.id}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Family Contact Dialog */}
      <Dialog
        open={openFamilyDialog}
        onClose={() => setOpenFamilyDialog(false)}
        maxWidth="sm"
        fullWidth
        data-vanthai-id="cloudcare-family-dialog"
      >
        <DialogTitle>Add Family Contact</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="family-name"
                value={newFamilyContact.name}
                onChange={(e) =>
                  setNewFamilyContact({ ...newFamilyContact, name: e.target.value })
                }
                data-vanthai-id="cloudcare-family-field-name"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship"
                name="family-relationship"
                placeholder="e.g., Spouse, Son, Daughter, Parent"
                value={newFamilyContact.relationship}
                onChange={(e) =>
                  setNewFamilyContact({ ...newFamilyContact, relationship: e.target.value })
                }
                data-vanthai-id="cloudcare-family-field-relationship"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Number"
                name="family-contact"
                placeholder="+91-XXXXXXXXXX"
                value={newFamilyContact.contact}
                onChange={(e) =>
                  setNewFamilyContact({ ...newFamilyContact, contact: e.target.value })
                }
                data-vanthai-id="cloudcare-family-field-contact"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="checkbox"
                  name="family-is-emergency"
                  checked={newFamilyContact.isEmergencyContact}
                  onChange={(e) =>
                    setNewFamilyContact({
                      ...newFamilyContact,
                      isEmergencyContact: e.target.checked,
                    })
                  }
                  data-vanthai-id="cloudcare-family-field-emergency"
                />
                <Typography variant="body2">Set as emergency contact</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFamilyDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddFamily}
            variant="contained"
            disabled={
              !newFamilyContact.name ||
              !newFamilyContact.relationship ||
              !newFamilyContact.contact
            }
            data-vanthai-id="cloudcare-family-save-btn"
          >
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
