import React, { useState, useEffect } from "react";
import axios from "axios";

const DatabaseStatus = ({ onStatusChange }) => {
  const [status, setStatus] = useState({ connected: null, loading: true });

  useEffect(() => {
    checkDatabaseStatus();
    // Check status every 10 seconds
    const interval = setInterval(checkDatabaseStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await axios.get("/api/db-status");
      const newStatus = { connected: response.data.connected, loading: false };
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (error) {
      const newStatus = { connected: false, loading: false };
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    }
  };

  if (status.loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          Checking database connection...
        </div>
      </div>
    );
  }

  if (status.connected === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <strong>MongoDB Not Connected</strong>
        </div>
        <p className="text-sm mb-2">
          Database connection is required for registration and login.
        </p>
        <div className="text-sm">
          <p className="mb-1">
            <strong>To start MongoDB:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Windows: Open Command Prompt and run{" "}
              <code className="bg-red-100 px-1 rounded">mongod</code>
            </li>
            <li>
              Mac: Run{" "}
              <code className="bg-red-100 px-1 rounded">
                brew services start mongodb-community
              </code>
            </li>
            <li>
              Or install MongoDB from{" "}
              <a
                href="https://www.mongodb.com/try/download/community"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                mongodb.com
              </a>
            </li>
          </ul>
        </div>
        <button
          onClick={checkDatabaseStatus}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
        >
          Check Again
        </button>
      </div>
    );
  }

  if (status.connected === true) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <strong>Database Connected</strong> - Ready for registration!
        </div>
      </div>
    );
  }

  return null;
};

export default DatabaseStatus;
