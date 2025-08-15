import { connectToDatabase } from '@/lib/mongodb';
import {User}  from '@/models/Schema';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        // console.log(email, password);
        await connectToDatabase();
        const user = await User.findOne({ email });
        // console.log(user);
        const jwtToken=jwt.sign({id:user._id.toString(),email:user.email}, process.env.SECRET_KEY, { expiresIn: '1h'  })
        
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' ,status:404}), { status: 404 });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid password' ,status: 401}), { status: 401 });
        }
        return new Response(JSON.stringify({
            successMsg: 'User authenticated successfully!  Welcome back!' ,
            status: 200,
            token:jwtToken,
            user: { email: user.email, name: user.name }
        }), {
            status: 200,
        });
    }
    catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
