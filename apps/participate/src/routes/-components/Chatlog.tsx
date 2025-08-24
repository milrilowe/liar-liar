import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";

export function Chatlog({ chatMessages }: { chatMessages: any }) {

    return (
        <Card className="border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="text-center pb-3 sm:pb-6 flex-shrink-0">
                <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-200 mx-auto mb-1 sm:mb-2" />
                <CardTitle className="text-white text-lg sm:text-xl">
                    Audience Messages{' '}
                    <span className="text-yellow-300">({chatMessages.length})</span>
                </CardTitle>
                <CardDescription className="text-white/80 text-sm">
                    Live feed from the crowd
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-3 sm:p-6">
                {chatMessages.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 h-full flex flex-col justify-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full border-2 sm:border-4 border-black/60 grid place-items-center mx-auto mb-3 sm:mb-4">
                            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <p className="text-white/90 text-sm sm:text-base">No messages yet…</p>
                        <p className="text-white/80 text-xs sm:text-sm mt-1">Audience messages will appear here.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-full pr-1 sm:pr-2">
                        <div className="space-y-2 sm:space-y-4">
                            {chatMessages.map((msg: any) => (
                                <Card key={msg._id} className="border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                                    <CardContent className="p-3 sm:p-4">
                                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full border-2 sm:border-4 border-black grid place-items-center flex-shrink-0">
                                                    <span className="text-black text-xs font-black">
                                                        {msg.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-white text-sm sm:text-base truncate">{msg.username}</span>
                                            </div>
                                            <span className="text-xs text-white/80 flex-shrink-0 ml-2">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-white leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base break-words">{msg.text}</p>
                                        {msg.promptText && (
                                            <div className="bg-black/30 rounded-lg p-2 sm:p-3 border-2 border-black/70">
                                                <p className="text-xs text-yellow-200 mb-1">During prompt:</p>
                                                <p className="text-white/95 text-xs sm:text-sm italic break-words">"{msg.promptText}"</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}