import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token not provided', status: 400 }));
    }

    const verifyPayload = jwt.verify(token, process.env.SECRET_KEY);
    

    return new Response(JSON.stringify({ 
      userEmail: verifyPayload.email, 
      userID: verifyPayload.id,
      status: 200 
    }));
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, status: 500 }));
  }
}
