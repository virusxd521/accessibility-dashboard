import fetch from 'node-fetch';

export async function handler(event) {
  const endpoint = event.path.replace('/.netlify/functions/n8n-proxy', '');
  const url = `https://rendered-cloud-salon-mpeg.trycloudflare.com${endpoint}`;

  const res = await fetch(url, {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json'
      // Optionally forward some headers, but NOT host
    },
    body: ['POST', 'PUT', 'PATCH'].includes(event.httpMethod) ? event.body : undefined,
  });

  const contentType = res.headers.get('content-type') || 'application/json';
  const body = await res.text();

  return {
    statusCode: res.status,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
    body
  };
}
