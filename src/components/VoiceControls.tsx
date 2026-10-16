import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Square } from "lucide-react";

interface VoiceControlsProps {
  onStart: () => void;
  onStop: () => void;
  onHearAgain: () => void;
  onEndThread: () => void;
  isRecording?: boolean;
  isSpeaking?: boolean;
  isLoading?: boolean;
}

export function VoiceControls({
  onStart,
  onStop,
  onHearAgain,
  onEndThread,
  isRecording = false,
  isSpeaking = false,
  isLoading = false,
}: VoiceControlsProps) {
  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
      {/* Main Voice Button - Toggle between Start (Green) and Stop (Red) */}
      <div className="flex justify-center">
        <Button
          onClick={isRecording ? onStop : onStart}
          disabled={isLoading}
          size="lg"
          className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-2xl transition-all duration-200 ${
            isRecording
              ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
              : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          }`}
        >
          {isRecording ? (
            <Square className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
          ) : (
            <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-xl sm:text-2xl font-semibold text-gray-700">
          {isRecording ? "Listening..." : isSpeaking ? "Speaking..." : isLoading ? "Processing..." : "Tap to speak"}
        </p>
      </div>

      {/* Secondary Controls - Hear Again and End Thread */}
      <div className="flex justify-center gap-4 sm:gap-6">
        <Button
          onClick={onHearAgain}
          disabled={isLoading || isRecording}
          variant="outline"
          size="lg"
          className="h-16 sm:h-20 px-6 sm:px-10 rounded-2xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
        >
          <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
          <span className="text-lg sm:text-xl font-semibold text-gray-700">Hear Again</span>
        </Button>

        <Button
          onClick={onEndThread}
          disabled={isLoading || isRecording}
          variant="outline"
          size="lg"
          className="h-16 sm:h-20 px-6 sm:px-10 rounded-2xl border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-2 sm:mr-3" />
          <span className="text-lg sm:text-xl font-semibold text-gray-700">End Thread</span>
        </Button>
      </div>
    </div>
  );
}