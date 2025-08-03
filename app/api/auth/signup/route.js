import { connectToDatabase } from '@/lib/mongodb';
import {User} from '@/models/Schema';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (user) {
      return new Response(JSON.stringify({ error: `User Exist for the email` ,status:409}), { status: 409 });
    }
    else{
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password:hashedPassword });
      await user.save();
  
      return new Response(JSON.stringify({ successMsg: 'User signed up successfully', user: { email: user.email, name: user.name } ,status:201}), {
        status: 201,
      });
    }
  }
  catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
