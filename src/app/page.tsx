"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MastraLogo } from "@/components/logos/mastra-logo";
import { NeonLogo } from "@/components/logos/neon-logo";
import { NextjsLogo } from "@/components/logos/nextjs-logo";
import { OpenaiLogo } from "@/components/logos/openai-logo";
import { ShadcnLogo } from "@/components/logos/shadcn-logo";
import { TailwindLogo } from "@/components/logos/tailwind-logo";
import { ZustandLogo } from "@/components/logos/zustand-logo";

const EASE = [0.22, 1, 0.36, 1] as const;

const enter = (delay: number, reduce: boolean | null) =>
  reduce
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      }
    : {
        initial: { opacity: 0, y: 18, filter: "blur(10px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.75, delay, ease: EASE },
      };

const STACK: { name: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] =
  [
    { name: "Next.js", Icon: NextjsLogo },
    { name: "Mastra", Icon: MastraLogo },
    { name: "OpenAI", Icon: OpenaiLogo },
    { name: "Tailwind CSS", Icon: TailwindLogo },
    { name: "shadcn/ui", Icon: ShadcnLogo },
    { name: "Zustand", Icon: ZustandLogo },
    { name: "NeonDB", Icon: NeonLogo },
  ];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const reduce = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const imageHidden = reduce
    ? { opacity: 1, scale: 1, filter: "blur(0px)" }
    : { opacity: 0, scale: 1.12, filter: "blur(16px)" };
  const imageShown = { opacity: 1, scale: 1, filter: "blur(0px)" };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-black text-white selection:bg-purple-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 brightness-[0.62]">
          <motion.img
            ref={imgRef}
            src="https://pub-3b215ec928d840b59e41f77a776731b9.r2.dev/chiama-bg.png"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            initial={imageHidden}
            animate={isLoaded || reduce ? imageShown : imageHidden}
            transition={{ duration: 1.15, ease: EASE }}
            style={{ transformOrigin: "right center" }}
            className="absolute inset-0 h-full w-full max-w-none object-cover object-[68%_center] sm:object-[78%_center] lg:object-right [@media(min-aspect-ratio:16/9)]:object-contain [@media(min-aspect-ratio:16/9)]:object-right"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/55 to-black/10 sm:via-black/40 sm:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/80 to-transparent sm:h-28" />
      </div>

      <main className="relative z-10 flex w-full flex-1 flex-col justify-center px-5 pt-16 pb-10 sm:px-10 sm:pt-20 md:px-16 lg:px-20">
        <div className="w-full max-w-xl space-y-5 sm:space-y-6">
          <motion.div
            {...enter(0.05, reduce)}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-zinc-900/60 px-3.5 py-1.5 shadow-sm backdrop-blur-md"
          >
            <span className="size-2.5 animate-pulse rounded-full bg-linear-to-tr from-blue-500 to-indigo-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="text-xs font-medium tracking-wide text-zinc-300">
              Multi Agent Platform
            </span>
          </motion.div>

          <motion.h1
            {...enter(0.14, reduce)}
            className="text-[2.65rem] leading-[1.05] font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Chiama{" "}
            <span className="bg-linear-to-r from-[#5da8ff] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          <motion.p
            {...enter(0.24, reduce)}
            className="max-w-md text-base leading-relaxed font-normal text-zinc-300 sm:text-lg"
          >
            Build, run and orchestrate multiple AI agents for real work.
          </motion.p>

          <motion.div {...enter(0.34, reduce)} className="pt-1">
            <Link
              href="/agent"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_50px_rgba(255,255,255,0.55)] active:scale-95 sm:text-base"
            >
              Use Agent
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 md:px-16 lg:px-20 sm:pb-10">
        <motion.div
          {...enter(0.42, reduce)}
          className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase sm:mb-4"
        >
          Built with
        </motion.div>

        <ul className="flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2.5 text-xs text-zinc-300 sm:gap-x-0 sm:text-sm">
          {STACK.map((item, index) => (
            <motion.li
              key={item.name}
              {...enter(0.48 + index * 0.05, reduce)}
              className="flex items-center"
            >
              {index > 0 && (
                <span
                  className="mr-3 hidden h-3.5 w-px bg-zinc-700 sm:mr-3 sm:ml-3 sm:block"
                  aria-hidden="true"
                />
              )}
              <span className="flex items-center gap-2">
                <item.Icon />
                <span className="font-medium">{item.name}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
