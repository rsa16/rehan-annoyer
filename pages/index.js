import Head from 'next/head'
import React, { useState, useEffect, useCallback } from "react";
import CustomLink from "../components/CustomLink";
import { motion } from 'framer-motion';
import { useRouter } from 'next/router'
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

export default function Home() {
  const server = "wss://ws.ralexa.tk";
  const isBrowser = typeof window !== "undefined";
  const [wsInstance, setWsInstance] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    Notify.init({
      success: {
        background: '#2564eb'
      }
    });
  
    Loading.init({ svgColor: '#2564eb' });
  })

  useEffect(() => {
    if (isBrowser) {
      let isLoggedIn = localStorage.getItem("isLoggedIn");

      if (isLoggedIn !== "true") {
        router.push("/login");
      }
    }
  }, [isBrowser, router]);

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

  // Function to call when creating new connection
  const updateWs = useCallback((url) => {
    // If the code isn't running on server side, set WsInstance to null
    if (!isBrowser) return setWsInstance(null);

    // If the code is not in a ready state or a closed state (i.e. in a closing state), close the instance anyway
    if (wsInstance?.readyState !== 3) {
      wsInstance.close();
    }

		let success = false;


		const newWs = new WebSocket(url);
		newWs.onerror = function(event) {
			Notify.failure("Connection failed. Plese try again later, Rehan is unreachable at the moment");
		}
		setWsInstance(newWs);
    
		// Create new websocket
		//try {
		//	const newWs = new WebSocket(url);
		//	setWsInstance(newWs);
		//}
		//catch (err) {
		//	success = false;
		//}

		//if (success === false) {
		//	Notify.failure("Connection failed. Please try again later, Rehan is unreachable at the moment")
		//}
  }, [isBrowser, wsInstance, Notify]);

  // Use effect hook to prevent memory leaks.
  useEffect(() => {
    // If the code is running in the client side, create Websocket (websocket only works in client side)
    if (isBrowser) {
      	const ws = new WebSocket(server);
				ws.onopen = function (event) {
					Notify.success("Connected to server!");
				}
				ws.onerror = function (event) {
					Notify.failure("Connection failed. Please try again later, Rehan is unreachable at the moment");
				}
				setWsInstance(ws);
    }

    // Unmount code: If the connection isn't already closed, close it when the component unmounts. (page is closed, close connection)
    return () => {
      if (ws?.readyState !== 3) {
        ws.close();
      }
    }
  }, [isBrowser]);

  async function annoy(e) {
    let username = localStorage.getItem("username");

    e.preventDefault();
    // If the instance is open, send message, otherwise, reinitialize instance
    if (wsInstance.readyState === wsInstance.OPEN) {
      wsInstance.send(username + ":" + " " + message);
      Loading.dots();
      await new Promise(resolve => setTimeout(resolve, 700));
      Loading.remove();
      Notify.success("The message was sent!")
    } else {
			Loading.dots();
			await new Promise(resolve => setTimeout(resolve, 1500));
			Loading.remove();
      updateWs(server);
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
        <motion.p variants={title} className="text-center mt-3 text-gray-500">This is the worst idea I&apos;ve ever had. (Check About Page)</motion.p>
        <motion.input variants={title} onChange={(e) => setMessage(e.target.value)} value={message} type="text" className="cursor-text focus:ring-indigo-500 mt-1 text-center focus:border-indigo-500 block border-gray-300 rounded-md box-width mb-5"/>
        <motion.button variants={fade} type="submit" className="center rounded-md sm:w-32 w-16 sm:h-10 h-8 sm:text-base text-sm text-white transition duration-300 bg-blue-600 hover:bg-blue-800">Annoy</motion.button>
      </form>
      <CustomLink variants={fade} href="/about" text="About This Project" extraClasses="absolute bottom-0 left-0 sm:mb-5 sm:ml-5 sm:text-base mb-3 ml-3 text-sm"/>
    </motion.div>
  )
}
