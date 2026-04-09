import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Fade,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'PROVIDER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in={true} timeout={500}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.fullName || user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  @{user.username}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.username}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                {user.fullName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.fullName}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {user.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {user.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <LocationOnIcon sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.address}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>
    </Container>
  );
};

export default Profile;

