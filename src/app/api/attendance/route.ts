import axios from 'axios';

export async function POST(req) {
  try {
    const { employee_id, employee_name } = await req.json();
    
    // Get the client's IP from various possible headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const clientIP = forwardedFor?.split(',')[0] || realIP || req.headers.get('x-client-ip');

    const response = await axios.post('https://admin.unlocklive.com/api/attendance/', {
      employee_id: employee_id,
      employee_name: employee_name,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIP,
        'X-Real-IP': clientIP,
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calling the API', error);
    
    // Forward the error message from Django if available
    const errorMessage = error.response?.data?.error || 'Error calling the API';
    const status = error.response?.status || 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.response?.data || {} 
    }), {
      status: status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
