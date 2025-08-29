'use client';
import React, { useState } from 'react';
import Notification from './Notification';
import { FaGithub,FaDiscord,FaFacebookSquare   } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";


const Login = () => {
  const [message, setMessage] = useState('');
  const {data: session}=useSession();
  const GitHubLoginButton=()=> {

  return (
    <button
      onClick={()=>signIn('github',{ callbackUrl: '/' })}
      className="flex items-center justify-center px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm bg-black space-x-2 text-sm font-medium text-white cursor-pointer">
      <FaGithub className="text-[1.5rem]" />
      <span className="font-medium">Sign in with GitHub</span>
    </button>
  );
}
  const DiscordLoginButton=()=> {

  return (
    <button
      onClick={()=>signIn('discord',{ callbackUrl: '/' })}
      className="flex items-center justify-center px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm bg-violet-600 space-x-2 text-sm font-medium text-white cursor-pointer">
      <FaDiscord className="text-[1.5rem]" />
      <span className="font-medium">Sign in with Discord</span>
    </button>
  );
}

  const FacebookLoginButton=()=> {

  return (
    <button
      onClick={()=>signIn('facebook',{ callbackUrl: '/' })}
      className="flex items-center justify-center px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm bg-blue-700 space-x-2 text-sm font-medium text-white cursor-pointer">
      <FaFacebookSquare className="text-[1.5rem]" />
      <span className="font-medium">Sign in with Facebook</span>
    </button>
  );
}
  const GoogleLoginButton=()=> {
  
  return (
    <button
      onClick={()=>signIn('google',{ callbackUrl: '/' })}
      className="flex items-center justify-center px-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm bg-blue-400 space-x-2 text-white text-sm font-medium cursor-pointer"
    >
      <FcGoogle  className="text-[1.5rem]" />
      <span className="font-medium">Sign in with Google</span>
    </button>
  );
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">SignIn to AiForge</h2>
        <div className='flex items-center flex-col space-y-4'>
          {GoogleLoginButton()}
          {GitHubLoginButton()}
          {DiscordLoginButton()}
          {/* {FacebookLoginButton()} */}
        </div>
        {/* <div className='my-5 flex justify-center'>
        <span className='text-center text-black font-semibold'>OR</span>
        </div> */}
        {/* <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form> */}
        <Notification userName={message.status === 200 ? message.user.name : null} isLogin={true} email={session && session.user.name} message={message.status === 404 || message.status === 401 ? message.error : message.successMsg} statusCode={message.status} onClose={() => setMessage('')} />
        
        {/* <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
