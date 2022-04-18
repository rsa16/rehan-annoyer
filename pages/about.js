import { motion } from "framer-motion";
import CustomLink from "../components/CustomLink";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen text-xl flex flex-col items-center justify-center relative bg-fixed bg-center bg-cover bg-no-repeat"
    >
      <h1 className="text-center break-normal md:break-words w-1/3">Are you bored? Do you want to annoy me? This website is perfect for you! Everything you type will be repeated back to me by a robotic voice. I think I&apos;m starting to regret this now. Help. Somebody. Please.&nbsp;</h1>
      <CustomLink href="/" text="Back" />
    </motion.div>
  );
}
