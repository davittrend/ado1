import { Handler } from '@netlify/functions';

const clientId = '1507772';
const clientSecret = '12e86e7dd050a39888c5e753908e80fae94f7367';
const redirectUri = 'https://adorable-shortbread-ea235b.netlify.app/callback';

// Using sandbox URL
const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const path = event.queryStringParameters?.path;

  try {
    switch (path) {
      case '/oauth/url': {
        const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
        const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=sandbox`;
        return { 
          statusCode: 200, 
          headers, 
          body: JSON.stringify({ url: authUrl }) 
        };
      }

      case '/token': {
        const { code, refresh_token } = event.queryStringParameters || {};
        
        if (!code && !refresh_token) {
          return { 
            statusCode: 400, 
            headers, 
            body: JSON.stringify({ error: 'Code or refresh token required' }) 
          };
        }
