// Configure axios base URL for production
import axios from "axios";

// Get the API base URL from environment variable or fallback
const getBaseURL = () => {
  // For Azure deployment where frontend and backend are served from same domain
  if (window.location.hostname.includes(".azurewebsites.net")) {
    return ""; // Use relative URLs when on Azure
  }

  // Use environment variable for production deployment (Netlify, Vercel, etc.)
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "https://devmate-fghed0fgatfwd3ga.centralindia-01.azurewebsites.net";
  }

  // For local development
  return "http://localhost:8080";
};

const API_BASE_URL = getBaseURL();
axios.defaults.baseURL = API_BASE_URL;

console.log("Axios configured with base URL:", API_BASE_URL);

export default axios;
