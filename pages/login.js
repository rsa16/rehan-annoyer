import { motion } from 'framer-motion';
import { useRouter } from 'next/router'
import Head from 'next/head'
import React, { useRef } from 'react';

export default function Login() {
    const router = useRouter();
    const username = useRef(null);

    const content = {
        initial: {
          opacity: 1
        },
        animate: {
          transition: { staggerChildren: 0.3 }
        },
        exit: {
          opacity: 0
        }
      };
    
      const title = {
        initial: { y: -20, opacity: 0 },
        animate: {
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.7,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      };
    
      const fade = {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            duration: 0.2,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      };

    function submitHandler(e) {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username.current.value);
        router.push('/');
    }

    return (
      <motion.div initial="initial" animate="animate" exit="exit" variants={content} className="h-screen flex flex-col items-center justify-center ">
        <Head>
          <title>Login</title>
        </Head>
        <form onSubmit={submitHandler} className="h-1/3 w-1/3 flex flex-col items-center justify-center">
          <motion.h1 variants={title} className="block text-center text-xl">Please enter your username.</motion.h1>
          <motion.input ref={username} variants={title} type="text" className="border-gray-300 focus:ring-indigo-500 block mt-1 rounded-md w-72 sm:w-96 text-center mb-2" placeholder="Username" />
          <motion.button variants={fade} type="submit" className="rounded-md sm:w-32 w-16 sm:h-10 h-8 sm:text-base text-sm text-white transition duration-300 bg-blue-600 hover:bg-blue-800">Submit</motion.button>
        </form>
      </motion.div>
    )
}