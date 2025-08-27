import { connectToDatabase } from '@/lib/mongodb';
import {User}  from '@/models/Schema';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const { email } = await req.json();
        // console.log(email, password);
        await connectToDatabase();
        const user = await User.findOne({ email });
        // console.log(user);
        if (!user) {
            const user= new User({ email });
            await user.save();
            return new Response(JSON.stringify({ successMsg: 'New User created' ,status:201}), { status: 201 });
        }
        else{          
            const jwtToken=jwt.sign({id:user._id.toString(),email:user.email}, process.env.SECRET_KEY, { expiresIn: '1h'  })
            return new Response(JSON.stringify({
                successMsg: 'User authenticated successfully!  Welcome back!' ,
                status: 200,
                token:jwtToken,
                user: { email: user.email, name: user.email.split('@')[0] }
            }), {
                status: 200,
            });
        }
        
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //     return new Response(JSON.stringify({ error: 'Invalid password' ,status: 401}), { status: 401 });
        // }
    }
    catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
