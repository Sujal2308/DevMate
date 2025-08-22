// Configure axios base URL for production
import axios from "axios";

// Get the API base URL from environment variable or fallback
const getBaseURL = () => {
  // For Azure deployment where frontend and backend are served from same domain
  if (window.location.hostname.includes(".azurewebsites.net")) {
    return ""; // Use relative URLs when on Azure
  }

  // Check if we're on the production domain
  if (window.location.hostname === "devmate.dev" || window.location.hostname.includes("devmate.dev")) {
    return process.env.REACT_APP_API_URL || "https://devmate-fghed0fgatfwd3ga.centralindia-01.azurewebsites.net";
  }

  // Use environment variable for other production deployments (Netlify, Vercel, etc.)
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_URL || "https://devmate-fghed0fgatfwd3ga.centralindia-01.azurewebsites.net";
  }

  // For local development
  return "http://localhost:8080";
};

const API_BASE_URL = getBaseURL();
axios.defaults.baseURL = API_BASE_URL;

console.log("Current hostname:", window.location.hostname);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
console.log("Axios configured with base URL:", API_BASE_URL);

export default axios;
