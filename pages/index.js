import Head from "next/head";
import React, { useState, useEffect, useCallback } from "react";
import CustomLink from "../components/CustomLink";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import { Loading } from "notiflix/build/notiflix-loading-aio";
import { Report } from "notiflix/build/notiflix-report-aio";	
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglass } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const server = "wss://ws.ralexa.tk";
  // const server = "ws://10.0.0.11:8080";
  const isBrowser = typeof window !== "undefined";
  const [wsInstance, setWsInstance] = useState(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [seconds, setSeconds] = React.useState(30);
		
  // Rate limit stuff
  // Milliseconds because programming is weird like that
  const timeout = 30 * 1000;
  const maxSubmits = 5;
  const intervalMilliseconds = 10 * 1000;
  const [disabled, setDisabled] = useState(false);
  const characterLimit = 500;

  var timesSubmitted = 0;
  var timerFunction;
  var [overCharLimit, setIsOverLimit] = useState(false);

  const [flash, setFlash] = useState(false);

  const flashFunc = () => {
    if (flash === false) {
      setFlash(true);
    } else if (flash === true) {
      setFlash(false);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      flashFunc();
    }, 1000);

    return () => clearInterval(intervalId);
  });


  useEffect(() => {
    Notify.init({
      success: {
        background: "#2564eb",
      },
    });

    Loading.init({ svgColor: "#2564eb" });
  });

  useEffect(() => {
    if (disabled) {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      }
    }
  });

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
      opacity: 1,
    },
    animate: {
      transition: { staggerChildren: 0.2 },
    },
    exit: {
      opacity: 0,
    },
  };

  const title = {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const fade = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const handleChange = (e) => {
    if (e.target.value.length >= characterLimit) {
      setIsOverLimit(true);
    } else {
      setMessage(e.target.value)
      setIsOverLimit(false);
    }
  }

  // Function to call when creating new connection
  const updateWs = useCallback(
    (url) => {
      // If the code isn't running on server side, set WsInstance to null
      if (!isBrowser) return setWsInstance(null);

      // If the code is not in a ready state or a closed state (i.e. in a closing state), close the instance anyway
      if (wsInstance?.readyState !== 3) {
        wsInstance.close();
      }

      let success = false;

      const newWs = new WebSocket(url);
      newWs.onerror = function (event) {
        console.log(event)
        Notify.failure(
          "Connection failed. Plese try again later, Rehan is unreachable at the moment"
        );
      };
      setWsInstance(newWs);
    },
    [isBrowser, wsInstance, Notify]
  );

  // Use effect hook to prevent memory leaks.
  useEffect(() => {
    // If the code is running in the client side, create Websocket (websocket only works in client side)
    if (isBrowser) {
      const ws = new WebSocket(server);
      ws.onopen = function (event) {
        Notify.success("Connected to server!");
      };

      ws.onerror = function (event) {
        console.log(event)
        Notify.failure(
          "Connection failed. Please try again later, Rehan is unreachable at the moment"
        );
      };
      setWsInstance(ws);
    }

    // Unmount code: If the connection isn't already closed, close it when the component unmounts. (page is closed, close connection)
    return () => {
      if (ws?.readyState !== 3) {
        ws.close();
      }
    };
  }, [isBrowser]);

  async function annoy(e) {
    let username = localStorage.getItem("username");
    e.preventDefault();
    // If the instance is open, send message, otherwise, reinitialize instance
    if (wsInstance.readyState === wsInstance.OPEN) {
      if (!timerFunction) {
        timerFunction = setTimeout(() => {
          timerFunction = undefined;
          timesSubmitted = 0;
          console.log("RATE LIMIT TIMER RESET");
        }, intervalMilliseconds);
      }

      timesSubmitted++;
      if (timesSubmitted >= maxSubmits) {
        Report.warning(
          "Spam Warning",
          "You have sent too many messages at once. Please calm down and wait 30 seconds before you are allowed to send again.",
          "Okay",
          {
            timeout: 30 * 1000,
          }
        );
        timesSubmitted = 0;
        setDisabled(true);
        setSeconds(30);

        setTimeout(() => {
          setDisabled(false);
          Notify.info("You are allowed to send messages again!");
        }, timeout);
      } else {
        wsInstance.send(username + ":" + " " + message);
        Loading.dots();
        await new Promise((resolve) => setTimeout(resolve, 700));
        Loading.remove();
        Notify.success("The message was sent!");
      }
    } else {
      Loading.dots();
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Loading.remove();
      updateWs(server);
    }
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={content}
      className="flex h-screen justify-center items-center"
    >
      <Head>
        <title>Ralexa</title>
        <meta
          name="description"
          content="Annoy Rehan by making his speaker say anything you want"
        />
      </Head>
      <form onSubmit={annoy} className="">
        <motion.h1
          variants={title}
          className="text-center text-6xl font-bold text-blue-600"
        >
          Annoy Rehan
        </motion.h1>
        <motion.p variants={title} className="text-center mt-3 text-gray-500">
          This is the worst idea I&apos;ve ever had. (Check About Page)
        </motion.p>
        <div
          className={`flex flex-row transition-all duration-300 justify-center my-2 ${
            disabled ? "opacity-100" : "absolute opacity-0"
          }`}
        >
          <FontAwesomeIcon
            className={`transition duration-500 mt-1 top-0 ${ flash ? "text-red-500": "text-blue-500"}`}
            size="lg"
            icon={faHourglass}
          />
          <span className="ml-2 text-lg">00</span>&nbsp;:&nbsp;
          <span className="text-lg">00</span>&nbsp;:&nbsp;
          <span className="text-lg">{seconds}</span>
        </div>
        <motion.input
          disabled={disabled}
          variants={title}
          onChange={handleChange}
          value={message}
          type="text"
          className={"cursor-text mt-1 mx-auto text-center block transition duration-300 border-gray-300 rounded-md box-width mb-3" + `${overCharLimit ? "border-red-600 ring-red-600" : ""}`}
        />
        <motion.button
          disabled={disabled}
          variants={fade}
          type="submit"
          className={`center rounded-md sm:w-32 w-16 sm:h-10 h-8 sm:text-base text-sm text-white transition duration-300 ${
            disabled ? "bg-zinc-400" : "bg-blue-600 hover:bg-blue-800"
          }`}
        >
          Annoy
        </motion.button>
      </form>
      <CustomLink
        variants={fade}
        href="/about"
        text="About This Project"
        extraClasses="absolute bottom-0 left-0 sm:mb-5 sm:ml-5 sm:text-base mb-3 ml-3 text-sm"
      />
    </motion.div>
  );
}
