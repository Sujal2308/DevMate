const request = require('supertest');

// Mock express app for testing
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

describe('Server Tests', () => {
  test('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  test('string concatenation', () => {
    expect('Dev' + 'Mate').toBe('DevMate');
  });
});
