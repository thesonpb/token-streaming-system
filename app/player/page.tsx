"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Home,
  ShieldAlert,
  Shield,
  Skull,
  AlertTriangle,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

export default function PlayerPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { username, userType } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [tokenStatus, setTokenStatus] = useState<
    "valid" | "checking" | "invalidated"
  >("valid");
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "error"
  >("connected");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPirateWarning, setShowPirateWarning] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if no username
  useEffect(() => {
    if (mounted && !username) {
      router.push("/");
    }
  }, [mounted, username, router]);

  // Simulate token invalidation for pirate mode
  useEffect(() => {
    if (userType === "pirate" && playing) {
      const timer = setTimeout(() => {
        setTokenStatus("checking");

        setTimeout(() => {
          setTokenStatus("invalidated");
          setConnectionStatus("error");
          setPlaying(false);
          setShowPirateWarning(true);
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }, 2000);
      }, 10000); // Invalidate after 10 seconds of playback

      return () => clearTimeout(timer);
    }
  }, [userType, playing]);

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 100);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateTime);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      if (tokenStatus !== "invalidated") {
        videoRef.current.play();
      }
    }

    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;

    const newVolume = value[0];
    videoRef.current.volume = newVolume / 100;
    setVolume(newVolume);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;

    const newTime = (value[0] / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!mounted || !username) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={userType === "legitimate" ? "outline" : "destructive"}
            className="text-sm py-1.5"
          >
            {userType === "legitimate" ? (
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                Legitimate Viewer: {username}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Skull className="h-4 w-4" />
                UNAUTHORIZED USER: {username}
              </span>
            )}
          </Badge>

          <div className="flex gap-2">
            <Badge
              variant={
                connectionStatus === "connected"
                  ? "outline"
                  : connectionStatus === "connecting"
                  ? "secondary"
                  : "destructive"
              }
            >
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Connection Error"}
            </Badge>

            <Badge
              variant={
                tokenStatus === "valid"
                  ? "outline"
                  : tokenStatus === "checking"
                  ? "secondary"
                  : "destructive"
              }
            >
              Token:{" "}
              {tokenStatus === "valid"
                ? "Valid"
                : tokenStatus === "checking"
                ? "Checking..."
                : "Invalidated"}
            </Badge>
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-card/50 backdrop-blur">
          <div className="relative aspect-video bg-black">
            {showPirateWarning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-bold text-destructive mb-2">
                  Token Invalidated
                </h3>
                <p className="text-muted-foreground mb-4">
                  Unauthorized streaming detected. Your token has been
                  invalidated due to suspicious activity.
                </p>
                <Button variant="destructive" onClick={() => router.push("/")}>
                  Return to Home
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              poster="/placeholder.svg?height=720&width=1280"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[currentTime ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    disabled={tokenStatus === "invalidated"}
                  >
                    {playing ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={toggleMute}>
                    {muted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>

                  <div className="w-24 hidden sm:block">
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pathname === "/player" && (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full text-sm">
                      <Play className="h-4 w-4 text-green-500" />
                      <span className="hidden sm:inline-block">
                        Streaming Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full border-border bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Stream Information</CardTitle>
          <CardDescription>
            {userType === "legitimate"
              ? "This is a legitimate stream with valid token authentication."
              : "This is a demonstration of piracy detection. The stream will be interrupted after a short period."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Stream Quality</span>
                <span className="text-sm font-medium">1080p</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Buffer Health</span>
                <span className="text-sm font-medium">
                  {tokenStatus === "invalidated" ? "0%" : "98%"}
                </span>
              </div>
              <Progress
                value={tokenStatus === "invalidated" ? 0 : 98}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Token Validity</span>
                <span className="text-sm font-medium">
                  {tokenStatus === "valid"
                    ? "Valid"
                    : tokenStatus === "checking"
                    ? "Checking..."
                    : "Invalid"}
                </span>
              </div>
              <Progress
                value={
                  tokenStatus === "valid"
                    ? 100
                    : tokenStatus === "checking"
                    ? 50
                    : 0
                }
                className={`h-2 ${
                  tokenStatus === "valid"
                    ? ""
                    : tokenStatus === "checking"
                    ? "bg-amber-500"
                    : "bg-destructive"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
