"use client";

import { Mic, Square, RotateCcw, LogOut } from "lucide-react";

interface VoiceControlsProps {
  onStart?: () => void;
  onStop?: () => void;
  onHearAgain?: () => void;
  onEndThread?: () => void;
}

export function VoiceControls({
  onStart = () => {},
  onStop = () => {},
  onHearAgain = () => {},
  onEndThread = () => {},
}: VoiceControlsProps) {
  return (
    <section
      aria-label="Voice assistant controls"
      className="mx-auto w-full max-w-lg px-4 py-8"
    >
      {/* Primary action */}
      <div className="mb-8 flex justify-center">
        <button
          onClick={onStart}
          aria-label="Start talking"
          className="flex h-52 w-52 flex-col items-center justify-center
          rounded-full border-[8px] border-green-200 bg-green-600
          text-white shadow-xl transition-all duration-200
          hover:scale-105 hover:bg-green-700 active:scale-95
          focus-visible:outline focus-visible:outline-4
          focus-visible:outline-offset-4 focus-visible:outline-green-800
          sm:h-56 sm:w-56"
        >
          <Mic size={58} strokeWidth={2.5} />
          <span className="mt-3 text-3xl font-extrabold tracking-wide">
            START
          </span>
          <span className="mt-1 text-lg">Tap to talk</span>
        </button>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* STOP */}
        <button
          onClick={onStop}
          aria-label="Stop speaking or listening"
          className="flex min-h-36 flex-col items-center justify-center
          rounded-3xl border-4 border-red-200 bg-red-600 px-2 py-5
          text-white shadow-lg transition-all hover:bg-red-700
          active:scale-95 focus-visible:outline focus-visible:outline-4
          focus-visible:outline-offset-2 focus-visible:outline-red-800"
        >
          <Square size={36} fill="currentColor" strokeWidth={2.5} />
          <span className="mt-3 text-xl font-extrabold sm:text-2xl">
            STOP
          </span>
          <span className="mt-1 text-center text-sm">Pause voice</span>
        </button>

        {/* HEAR AGAIN */}
        <button
          onClick={onHearAgain}
          aria-label="Hear the last response again"
          className="flex min-h-36 flex-col items-center justify-center
          rounded-3xl border-4 border-blue-200 bg-blue-600 px-2 py-5
          text-white shadow-lg transition-all hover:bg-blue-700
          active:scale-95 focus-visible:outline focus-visible:outline-4
          focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        >
          <RotateCcw size={36} strokeWidth={2.5} />
          <span className="mt-3 text-center text-base font-extrabold sm:text-xl">
            HEAR AGAIN
          </span>
          <span className="mt-1 text-center text-sm">Repeat response</span>
        </button>

        {/* END THREAD */}
        <button
          onClick={onEndThread}
          aria-label="End this conversation"
          className="flex min-h-36 flex-col items-center justify-center
          rounded-3xl border-4 border-purple-200 bg-purple-700 px-2 py-5
          text-white shadow-lg transition-all hover:bg-purple-800
          active:scale-95 focus-visible:outline focus-visible:outline-4
          focus-visible:outline-offset-2 focus-visible:outline-purple-900"
        >
          <LogOut size={36} strokeWidth={2.5} />
          <span className="mt-3 text-center text-sm font-extrabold sm:text-lg">
            END THREAD
          </span>
          <span className="mt-1 text-center text-sm">Finish chat</span>
        </button>
      </div>
    </section>
  );
}