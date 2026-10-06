import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto w-full space-y-12 sm:space-y-16">
        <div className="w-full max-w-3xl text-center space-y-4 pt-4 sm:pt-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-100 max-w-2xl mx-auto leading-[1.15]">
            Chiama Weather Agent
          </h1>
          <h1 className="text-xl sm:text-5xl lg:text-4xl font-light tracking-tight text-zinc-100 max-w-2xl mx-auto leading-[1.15]">
            Atmospheric intelligence, <br className="hidden sm:inline" />
            <span className="font-normal text-white">spoken in real time.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
            Query planetary barometric telemetries, simulate outdoor activities,
            or initiate an ultra-low latency voice call with your personal
            meteorological agent.
          </p>
          <Link href="/agent">
            <Button>Use Agent</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
