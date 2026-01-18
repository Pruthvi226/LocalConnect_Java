import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services/${service.id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleClick}
    >
      {service.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={service.imageUrl}
          alt={service.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {service.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {service.description?.substring(0, 100)}...
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {service.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip label={service.category} size="small" color="primary" />
          <Typography variant="h6" color="primary">
            ${service.price}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={service.averageRating || 0} readOnly precision={0.1} size="small" />
          <Typography variant="body2" color="text.secondary">
            ({service.totalReviews || 0} reviews)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
