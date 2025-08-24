import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

export function ChatInput({ handleMessageSubmit, messageInput, setMessageInput, isSubmitting }: {
    handleMessageSubmit: any,
    messageInput: any,
    setMessageInput: any,
    isSubmitting: any
}) {

    return (
        <div className="mt-auto pt-2 sm:pt-4">
            <Card className="border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-2 sm:p-1">
                    <form onSubmit={handleMessageSubmit} className="flex gap-2 sm:gap-3">
                        <div className="flex-1 relative">
                            <Input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Send a message"
                                maxLength={500}
                                disabled={isSubmitting}
                                className="bg-white/90 text-black border-2 sm:border-4 border-black placeholder:text-black/50 rounded-lg sm:rounded-xl h-10 sm:h-12 pr-8 sm:pr-10 text-sm sm:text-base"
                                style={{ fontFamily: '"Baloo 2",system-ui,sans-serif', fontWeight: 600 }}
                            />
                            <MessageCircle className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-black/50" />
                        </div>
                        <Button
                            type="submit"
                            disabled={!messageInput.trim() || isSubmitting}
                            className="bg-yellow-400 text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base font-black hover:brightness-105 active:translate-y-[1px] px-3 sm:px-4"
                            style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                        >
                            <Send className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden xs:inline">{isSubmitting ? '...' : 'Send'}</span>
                            <span className="xs:hidden">{isSubmitting ? '...' : 'Go'}</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}