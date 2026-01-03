import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mic, Volume2, MessageSquare } from "lucide-react";

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Use Lois's Assistant</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click "New Conversation" to begin. The big button will show "START TALKING" - click it when you're ready to speak.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Recording Your Voice</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  When the button turns red and says "STOP TALKING", speak clearly. You'll see your words appear as you talk.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Click "STOP TALKING" when you're done speaking, and I'll process your message.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Volume2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Response</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  I'll think about your message and then speak my response out loud. You can click "Stop Speaking" if you need me to be quiet.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  After I finish, choose "CONTINUE TALKING" for another exchange, or "END & SAVE" to finish.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3">What I Can Help With</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Create and manage shopping lists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Track inventory items (like organizing your loft)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Answer questions and have natural conversations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Remember context across multiple exchanges</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                <span>Speak clearly and wait for the button to turn red before talking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                <span>All conversations are saved - you can resume them anytime from the sidebar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                <span>I remember everything we discussed in a conversation, so you can reference earlier topics</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}