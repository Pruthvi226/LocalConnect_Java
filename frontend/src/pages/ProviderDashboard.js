import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { providerService } from '../services/providerService';
import { serviceService } from '../services/serviceService';
import ThreeDBackground from '../components/ThreeDBackground';
import dayjs from 'dayjs';

const ProviderDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', category: '', price: '', location: '', isAvailable: true });
  const [bookingStatusDialog, setBookingStatusDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, servicesData, bookingsData] = await Promise.all([
        providerService.getSummary(),
        providerService.getMyServices(),
        providerService.getProviderBookings(),
      ]);
      setSummary(summaryData);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenServiceDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title,
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        location: service.location || '',
        isAvailable: service.isAvailable !== false,
      });
    } else {
      setEditingService(null);
      setServiceForm({ title: '', description: '', category: '', price: '', location: '', isAvailable: true });
    }
    setServiceDialogOpen(true);
  };

  const handleSaveService = async () => {
    try {
      const payload = {
        ...serviceForm,
        price: parseFloat(serviceForm.price) || 0,
      };
      if (editingService) {
        await serviceService.update(editingService.id, payload);
      } else {
        await serviceService.create(payload);
      }
      setServiceDialogOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await serviceService.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenStatusDialog = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdate(booking.status || '');
    setBookingStatusDialog(true);
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBooking || !statusUpdate) return;
    try {
      await providerService.updateBookingStatus(selectedBooking.id, statusUpdate);
      setBookingStatusDialog(false);
      setSelectedBooking(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const statCards = [
    { label: 'Total Services', value: summary?.totalServices ?? 0 },
    { label: 'Pending Bookings', value: summary?.pendingBookings ?? 0 },
    { label: 'Confirmed', value: summary?.confirmedBookings ?? 0 },
    { label: 'Completed', value: summary?.completedBookings ?? 0 },
    { label: 'Revenue', value: summary?.totalRevenue != null ? `$${Number(summary.totalRevenue).toFixed(2)}` : '$0' },
    { label: 'Unread Notifications', value: summary?.unreadNotifications ?? 0 },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h4">Provider Dashboard</Typography>
        <Box sx={{ width: 180, height: 100, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
          <ThreeDBackground style={{ height: '100%' }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {statCards.map(({ label, value }) => (
          <Card key={label} sx={{ minWidth: 140 }}>
            <CardContent>
              <Typography color="textSecondary" variant="body2">{label}</Typography>
              <Typography variant="h5">{value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>My Services</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Available</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.title}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>${s.price}</TableCell>
                <TableCell><Chip label={s.isAvailable ? 'Yes' : 'No'} size="small" color={s.isAvailable ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenServiceDialog(s)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteService(s.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenServiceDialog()}>
        Add Service
      </Button>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Bookings</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.service?.title}</TableCell>
                <TableCell>{b.user?.fullName || b.user?.username}</TableCell>
                <TableCell>{b.bookingDate ? dayjs(b.bookingDate).format('MMM D, YYYY HH:mm') : '-'}</TableCell>
                <TableCell><Chip label={b.status} size="small" color={b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'error' : 'warning'} /></TableCell>
                <TableCell align="right">
                  {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                    <Button size="small" onClick={() => handleOpenStatusDialog(b)}>Update</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} margin="normal" />
          <TextField fullWidth label="Description" multiline value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} margin="normal" />
          <TextField fullWidth label="Category" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} margin="normal" />
          <TextField fullWidth label="Price" type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} margin="normal" />
          <TextField fullWidth label="Location" value={serviceForm.location} onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Available</InputLabel>
            <Select value={serviceForm.isAvailable} onChange={(e) => setServiceForm({ ...serviceForm, isAvailable: e.target.value })} label="Available">
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveService}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bookingStatusDialog} onClose={() => setBookingStatusDialog(false)}>
        <DialogTitle>Update Booking Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} label="Status">
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateBookingStatus}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderDashboard;
