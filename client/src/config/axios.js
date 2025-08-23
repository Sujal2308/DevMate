// Configure axios base URL for production
import axios from "axios";

// Get the current hostname for deployment
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // For devmate.dev (Netlify) - use relative URLs to leverage proxy
  if (hostname === "devmate.dev") {
    return ""; // Netlify will proxy /api/* to Azure backend
  }
  
  // For Azure deployment where frontend and backend are served from same domain
  if (hostname.includes(".azurewebsites.net")) {
    return ""; // Use relative URLs when on Azure
  }

  // For production deployments
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "https://devmate-fghed0fgatfwd3ga.centralindia-01.azurewebsites.net";
  }

  // For local development
  return "http://localhost:8080";
};

const API_BASE_URL = getBaseURL();
axios.defaults.baseURL = API_BASE_URL;

console.log("Axios configured with base URL:", API_BASE_URL);
console.log("Current hostname:", window.location.hostname);

export default axios;
