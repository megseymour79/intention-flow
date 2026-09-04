import { Link } from "react-router";
import { motion } from "framer-motion";

import { FloatingBackground } from "@/components/FloatingBackground";
import { StarMark } from "@/components/StarMark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <FloatingBackground count={12} />
      <header className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Link to="/" className="flex w-fit items-center gap-2.5">
          <StarMark size={34} />
          <span className="text-lg font-extrabold tracking-tight">
            Shifted<span className="text-amber-300">Mind</span>
          </span>
        </Link>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center"
      >
        <p className="animate-floaty text-6xl">🪐</p>
        <h1 className="mt-5 text-6xl font-extrabold tracking-tight">
          4<span className="text-amber-300">0</span>4
        </h1>
        <p className="mt-3 max-w-md text-lg text-foreground/75">
          This star drifted off the map. Even constellations have orphans.
        </p>
        <Button
          asChild
          className="mt-7 rounded-full bg-amber-300 px-6 font-bold text-amber-950 hover:bg-amber-200"
        >
          <Link to="/">Back to the sky</Link>
        </Button>
      </motion.div>
    </div>
  );
}
