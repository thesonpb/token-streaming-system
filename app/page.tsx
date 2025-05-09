"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Skull, Coins } from "lucide-react";
import { useUserStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { setUser, clearUser } = useUserStore();
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<"legitimate" | "pirate">(
    "legitimate"
  );
  const [nameError, setNameError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Please enter your name");
      return;
    }

    if (name.length > 30) {
      setNameError("Name must be less than 30 characters");
      return;
    }

    setUser(name, userType);
    router.push("/player");
  };

  const handleClear = () => {
    setName("");
    setUserType("legitimate");
    setNameError("");
    clearUser();
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex justify-center items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Token Ban Demo
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Enter your name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                className={nameError ? "border-destructive" : ""}
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Select user type</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) =>
                  setUserType(value as "legitimate" | "pirate")
                }
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                  <RadioGroupItem value="legitimate" id="legitimate" />
                  <Label
                    htmlFor="legitimate"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-green-500">A legitimate viewer</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-accent">
                  <RadioGroupItem value="pirate" id="pirate" />
                  <Label
                    htmlFor="pirate"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-bold text-destructive">
                      A PIRATE!
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleClear}>
              CLEAR
            </Button>
            <Button type="submit">GO TO PLAYER</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
