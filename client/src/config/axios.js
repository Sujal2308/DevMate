// Configure axios base URL for production
import axios from "axios";

// Get the current hostname for Azure deployment
const getBaseURL = () => {
  // For Azure deployment where frontend and backend are served from same domain
  if (window.location.hostname.includes(".azurewebsites.net")) {
    return ""; // Use relative URLs when on Azure
  }

  // For Netlify or other external deployments
  if (process.env.NODE_ENV === "production") {
    return "https://devmate-3k45.onrender.com"; // Your Render backend
  }

  // For local development
  return "http://localhost:8080";
};

const API_BASE_URL = getBaseURL();
axios.defaults.baseURL = API_BASE_URL;

console.log("Axios configured with base URL:", API_BASE_URL);

export default axios;
