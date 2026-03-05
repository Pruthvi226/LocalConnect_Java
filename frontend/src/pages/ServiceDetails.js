import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
  Paper,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Fade,
  Grow,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import GoogleMap from '../components/GoogleMap';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState(dayjs().add(1, 'day'));
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadService();
    loadReviews();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getById(id);
      setService(data);
    } catch (err) {
      setError('Failed to load service');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewService.getByService(id);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login/customer');
      return;
    }

    setBookingLoading(true);
    setBookingSuccess(false);
    setError(null);

    try {
      await bookingService.create(id, bookingDate.toDate(), bookingNotes);
      setBookingSuccess(true);
      setBookingNotes('');
      setBookingDate(dayjs().add(1, 'day'));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login/customer');
      return;
    }

    if (!reviewComment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    setReviewLoading(true);
    setError(null);

    try {
      await reviewService.create(id, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
      loadReviews();
      loadService();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!service) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Service not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in={true} timeout={500}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
            {service.imageUrl && (
              <Box
                component="img"
                src={service.imageUrl}
                alt={service.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2,
                }}
              />
            )}
            <Typography variant="h4" gutterBottom>
              {service.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={service.averageRating || 0} readOnly precision={0.1} />
              <Typography variant="body1">
                {service.averageRating?.toFixed(1)} ({service.totalReviews || 0} reviews)
              </Typography>
              <Chip label={service.category} color="primary" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon color="action" />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {service.location}
              </Typography>
            </Box>
            <Typography variant="h5" color="primary" gutterBottom>
              ${service.price}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {service.description}
            </Typography>
            {service.latitude && service.longitude && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <GoogleMap
                  latitude={service.latitude}
                  longitude={service.longitude}
                  title={service.title}
                />
              </Box>
            )}
          </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reviews ({reviews.length})
              </Typography>
              {reviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No reviews yet. Be the first to review!
                </Typography>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.user?.fullName || review.user?.username}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}

              {isAuthenticated && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Write a Review
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Rating
                      value={reviewRating}
                      onChange={(event, newValue) => setReviewRating(newValue)}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Your Review"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleReviewSubmit}
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

        <Grid item xs={12} md={4}>
          <Grow in={true} timeout={700}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Book This Service
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {bookingSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Booking created successfully!
              </Alert>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select Date & Time"
                value={bookingDate}
                onChange={(newValue) => setBookingDate(newValue)}
                minDate={dayjs()}
                sx={{ width: '100%', mb: 2 }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleBooking}
              disabled={bookingLoading || !service.isAvailable}
            >
              {bookingLoading
                ? 'Booking...'
                : service.isAvailable
                ? 'Book Now'
                : 'Not Available'}
            </Button>
            {!isAuthenticated && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Please <Button onClick={() => navigate('/login/customer')}>login</Button> to book
              </Typography>
            )}
            </Paper>
          </Grow>
        </Grid>
      </Grid>
      </Fade>
    </Container>
  );
};

export default ServiceDetails;
