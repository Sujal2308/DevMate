// Configure axios base URL for production
import axios from 'axios';

// Set the base URL to your deployed backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://devmate-3k45.onrender.com'  // Replace with your actual backend URL
  : 'http://localhost:5000';

axios.defaults.baseURL = API_BASE_URL;

export default axios;
