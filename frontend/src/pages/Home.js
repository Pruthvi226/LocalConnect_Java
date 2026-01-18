import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Box,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Fade,
  Grow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { serviceService } from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory, selectedLocation, minPrice, maxPrice]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll();
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (value.length > 2) {
      try {
        const suggestions = await serviceService.search(value);
        setSearchSuggestions(suggestions.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    if (selectedLocation) {
      filtered = filtered.filter((service) =>
        service.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter((service) => service.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((service) => service.price <= parseFloat(maxPrice));
    }

    setFilteredServices(filtered);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Find Local Services
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              freeSolo
              options={searchSuggestions.map((s) => s.title)}
              inputValue={searchQuery}
              onInputChange={(event, newValue) => handleSearchChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search services"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              placeholder="City, State"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom>
        {filteredServices.length} Services Found
      </Typography>

      {filteredServices.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 8 }}>
          No services found. Try adjusting your filters.
        </Typography>
      ) : (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {filteredServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Grow in={true} timeout={300 + index * 100}>
                  <Box>
                    <ServiceCard service={service} />
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Container>
  );
};

export default Home;
