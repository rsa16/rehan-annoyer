import Head from 'next/head'
import React, { useState, useEffect, useCallback } from "react";
import CustomLink from "../components/CustomLink";
import { motion } from 'framer-motion';

export default function Home() {
  const isBrowser = typeof window !== "undefined";
  const [wsInstance, setWsInstance] = useState(null);
  const [message, setMessage] = useState("");

  const content = {
    initial: {
      opacity: 1
    },
    animate: {
      transition: { staggerChildren: 0.2 }
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

  const updateWs = useCallback((url) => {
    if (!isBrowser) return setWsInstance(null);

    if (wsInstance?.readyState !== 3) {
      wsInstance.close();
    }

    const newWs = new WebSocket(url);
    setWsInstance(newWs);
  }, [isBrowser, wsInstance]);

  useEffect(() => {
    if (isBrowser) {
      const ws = new WebSocket("ws://10.0.0.64:8080");
      setWsInstance(ws);
    }

    return () => {
      if (ws?.readyState !== 3) {
        ws.close();
      }
    }
  }, [isBrowser]);

  async function annoy(e) {
    e.preventDefault();
    if (wsInstance.readyState === wsInstance.OPEN) {
      wsInstance.send(message);
    } else {
      updateWs("ws://10.0.0.64:8080");
    }
  }
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={content} className="flex h-screen justify-center items-center">
      <Head>
        <title>Ralexa</title>
        <meta name="description" content="Annoy Rehan by making his speaker say anything you want" />
      </Head>
      <form onSubmit={annoy} className="">
        <motion.h1 variants={title} className="text-center text-6xl font-bold text-blue-600">Annoy Rehan</motion.h1>
        <motion.p variants={title} className="text-center mt-3 text-gray-500">This is the worst idea I've ever had. (Check About Page)</motion.p>
        <motion.input variants={title} onChange={(e) => setMessage(e.target.value)} value={message} type="text" className="focus:ring-indigo-500 mt-1 text-center focus:border-indigo-500 block border-gray-300 rounded-md box-width mb-5"/>
        <motion.button variants={fade} type="submit" className="center rounded-md sm:w-32 w-16 sm:h-10 h-8 sm:text-base text-sm text-white transition duration-300 bg-blue-600 hover:bg-blue-800">Annoy</motion.button>
      </form>
      <CustomLink variants={fade} href="/about" text="About This Project" extraClasses="absolute bottom-0 left-0 sm:mb-5 sm:ml-5 sm:text-base mb-3 ml-3 text-sm"/>
    </motion.div>
  )
}
