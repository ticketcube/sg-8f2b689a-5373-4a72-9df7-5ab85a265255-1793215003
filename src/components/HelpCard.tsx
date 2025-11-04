
import { Card } from "@/components/ui/card";
import { Info, Mic, Volume2, MessageCircle } from "lucide-react";

export function HelpCard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">How to Use</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800">1. Press the HELP button</p>
            <p className="text-gray-600">The large green button in the center</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800">2. Wait for "Listening..."</p>
            <p className="text-gray-600">The button turns red when ready</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800">3. Ask your question</p>
            <p className="text-gray-600">Speak clearly and naturally</p>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-lg font-semibold text-gray-800 mb-2">Example questions:</p>
          <ul className="space-y-1 text-gray-700">
            <li className="text-base">• "What's the weather today?"</li>
            <li className="text-base">• "When is Hanukkah this year?"</li>
            <li className="text-base">• "What should I do for a headache?"</li>
            <li className="text-base">• "Tell me about vitamin D"</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
