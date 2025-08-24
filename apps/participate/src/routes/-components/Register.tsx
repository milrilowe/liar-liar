import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Starfield } from "./Starfield";
import { Crown, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { H1 } from "./H1";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";

export function Register({ handleUsernameSubmit, usernameInput, setUsernameInput, usernameError }: {
    handleUsernameSubmit: any,
    usernameInput: any,
    setUsernameInput: any,
    usernameError: any
}) {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center px-6 relative overflow-hidden">
            <Starfield />
            <Card className="w-full max-w-md border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-yellow-400 border-4 border-black grid place-items-center">
                        <Users className="w-8 h-8 text-black" />
                    </div>
                    <CardTitle>
                        <H1 tilt={1}>JOIN THE GAME</H1>
                    </CardTitle>
                    <CardDescription className="text-white/90">
                        Pick a handle to participate
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleUsernameSubmit} className="space-y-4">
                        <Input
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="Enter your username"
                            maxLength={20}
                            className="bg-white/90 text-black border-4 border-black placeholder:text-black/50 rounded-xl h-12"
                            style={{ fontFamily: '"Baloo 2",system-ui,sans-serif', fontWeight: 600 }}
                        />
                        {usernameError && (
                            <p className="text-sm text-red-200 text-center">{usernameError}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={!usernameInput.trim()}
                            className="w-full bg-yellow-400 text-black border-4 border-black rounded-xl h-12 text-lg font-black hover:brightness-105 active:translate-y-[1px]"
                            style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                        >
                            Join the Fun! 🎭
                        </Button>
                    </form>
                    <Separator className="bg-black/50" />
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate({ to: '/login' })}
                            className="text-yellow-200 hover:text-white"
                        >
                            <Crown className="mr-2 h-4 w-4" />
                            Comic Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}