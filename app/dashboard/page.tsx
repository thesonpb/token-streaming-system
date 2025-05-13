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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Ban,
  Eye,
  RefreshCw,
  ShieldAlert,
  Shield,
  User,
  FileText,
  Activity,
  Lock,
  Bot,
  LockOpen,
} from "lucide-react";
import { useUserStore, useTokenStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";

export default function ManagementPage() {
  const router = useRouter();
  const { username } = useUserStore();
  const { tokens, updateToken, toggleBan, batchBan, batchUnban } =
    useTokenStore();
  // const { users, updateUser, toggleUserBan, batchUserBan, batchUserUnban } = useUserData()
  // const { users, updateUser, batchUserBan, batchUserUnban } = useUserData();
  // Update how you get data from useUserData
  const {
    users,
    isLoading: isLoadingUsers, // Renamed for clarity if you have other loading states
    error: usersError,
    fetchUsers, // Get the fetch function
    updateUser,
    // toggleUserBan,
    batchUserBan,
    batchUserUnban,
  } = useUserData();
  const [mounted, setMounted] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("token");
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [updatedCells, setUpdatedCells] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Simulate real-time updates
  useEffect(() => {
    if (isLiveUpdating) {
      updateIntervalRef.current = setInterval(() => {
        const updatedCellsMap: { [key: string]: boolean } = {};

        // Update tokens
        if (activeTab === "token") {
          tokens.forEach((token) => {
            // Randomly decide if this token should be updated
            if (Math.random() > 0.5) {
              const updatedToken = { ...token };
              const updateField = Math.floor(Math.random() * 4);

              // Update a random field
              switch (updateField) {
                case 0:
                  const concurrentDelta = Math.random() > 0.7 ? 1 : -1;
                  if (updatedToken.concurrents + concurrentDelta >= 1) {
                    updatedToken.concurrents += concurrentDelta;
                    updatedCellsMap[`${token.id}-concurrents`] = true;
                  }
                  break;
                case 1:
                  const hits1mDelta =
                    Math.floor(Math.random() * 5) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedToken.hits1m + hits1mDelta >= 0) {
                    updatedToken.hits1m += hits1mDelta;
                    updatedCellsMap[`${token.id}-hits1m`] = true;
                  }
                  break;
                case 2:
                  const hits5mDelta =
                    Math.floor(Math.random() * 10) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedToken.hits5m + hits5mDelta >= 0) {
                    updatedToken.hits5m += hits5mDelta;
                    updatedCellsMap[`${token.id}-hits5m`] = true;
                  }
                  break;
                case 3:
                  const hits15mDelta =
                    Math.floor(Math.random() * 15) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedToken.hits15m + hits15mDelta >= 0) {
                    updatedToken.hits15m += hits15mDelta;
                    updatedCellsMap[`${token.id}-hits15m`] = true;
                  }
                  break;
              }

              // Update the token in the store
              updateToken(token.id, updatedToken);
            }
          });
        }

        // Update users
        if (activeTab === "user") {
          users.forEach((user) => {
            // Randomly decide if this user should be updated
            if (Math.random() > 0.5) {
              const updatedUser = { ...user };
              const updateField = Math.floor(Math.random() * 4);

              // Update a random field
              switch (updateField) {
                case 0:
                  const concurrentDelta = Math.random() > 0.7 ? 1 : -1;
                  if (updatedUser.concurrents + concurrentDelta >= 0) {
                    updatedUser.concurrents += concurrentDelta;
                    updatedCellsMap[`${user.id}-concurrents`] = true;
                  }
                  break;
                case 1:
                  const hits1mDelta =
                    Math.floor(Math.random() * 10) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedUser.hits1m + hits1mDelta >= 0) {
                    updatedUser.hits1m += hits1mDelta;
                    updatedCellsMap[`${user.id}-hits1m`] = true;
                  }
                  break;
                case 2:
                  const hits5mDelta =
                    Math.floor(Math.random() * 20) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedUser.hits5m + hits5mDelta >= 0) {
                    updatedUser.hits5m += hits5mDelta;
                    updatedCellsMap[`${user.id}-hits5m`] = true;
                  }
                  break;
                case 3:
                  const hits15mDelta =
                    Math.floor(Math.random() * 30) *
                    (Math.random() > 0.7 ? 1 : -1);
                  if (updatedUser.hits15m + hits15mDelta >= 0) {
                    updatedUser.hits15m += hits15mDelta;
                    updatedCellsMap[`${user.id}-hits15m`] = true;
                  }
                  break;
              }

              // Update the user in the store
              updateUser(user.id, updatedUser);
            }
          });
        }

        setUpdatedCells(updatedCellsMap);
        setLastUpdated(new Date());

        // Clear the updated cells after animation completes
        setTimeout(() => {
          setUpdatedCells({});
        }, 1000);
      }, 3000); // Update every 3 seconds

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }
  }, [isLiveUpdating, tokens, updateToken, users, updateUser, activeTab]);

  const handleRefreshUsers = async () => {
    setSelectedUsers([]); // Optionally clear selection on refresh
    await fetchUsers(); // Call the fetchUsers from the hook
  };

  const handleSelectToken = (tokenId: string) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllTokens = () => {
    if (selectedTokens.length === tokens.length) {
      setSelectedTokens([]);
    } else {
      setSelectedTokens(tokens.map((token) => token.id));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBatchBan = () => {
    batchBan(selectedTokens);
    setSelectedTokens([]);
  };

  const handleBatchUnban = () => {
    batchUnban(selectedTokens);
    setSelectedTokens([]);
  };

  const handleBatchUserBan = () => {
    batchUserBan(selectedUsers);
    setSelectedUsers([]);
  };

  const handleBatchUserUnban = () => {
    batchUserUnban(selectedUsers);
    setSelectedUsers([]);
  };

  const toggleLiveUpdates = () => {
    setIsLiveUpdating(!isLiveUpdating);
  };

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value >= critical) return "text-destructive";
    if (value >= warning) return "text-amber-500";
    return "text-green-500";
  };

  const getStatusBgColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value >= critical) return "bg-destructive/20";
    if (value >= warning) return "bg-amber-500/20";
    return "bg-green-500/20";
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";

    const now = new Date();
    const diffSeconds = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 1000
    );

    if (diffSeconds < 5) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  };

  if (!mounted || !username) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mitigation Strategy</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1.5">
            <User className="h-4 w-4 mr-1" />
            Admin: {username}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="token" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="token">
            <ShieldAlert className="h-4 w-4 mr-2" />
            TOKEN
          </TabsTrigger>
          <TabsTrigger value="user">
            <User className="h-4 w-4 mr-2" />
            USER
          </TabsTrigger>
          <TabsTrigger value="policy">
            <FileText className="h-4 w-4 mr-2" />
            POLICY
          </TabsTrigger>
        </TabsList>

        {/* token table */}
        <TabsContent value="token">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Token Management</CardTitle>
                  <CardDescription>
                    Monitor and manage token usage and suspicious activity
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isLiveUpdating ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    <Activity
                      className={cn(
                        "h-3 w-3 mr-1",
                        isLiveUpdating && "animate-pulse text-green-500"
                      )}
                    />
                    {isLiveUpdating ? "Live" : "Paused"}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdated()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLiveUpdates}
                  >
                    <Activity
                      className={cn(
                        "h-4 w-4 mr-2",
                        isLiveUpdating && "text-green-500"
                      )}
                    />
                    {isLiveUpdating ? "Pause Updates" : "Resume Updates"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token/User ID</TableHead>
                      <TableHead className="text-center">Concurrents</TableHead>
                      <TableHead className="text-center">Hits/1m</TableHead>
                      <TableHead className="text-center">Hits/5m</TableHead>
                      <TableHead className="text-center">Hits/15m</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id} className="group">
                        <TableCell className="font-medium">
                          {token.id}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(token.concurrents, [3, 5]),
                            updatedCells[`${token.id}-concurrents`] &&
                              "bg-accent"
                          )}
                        >
                          {token.concurrents}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(token.hits1m, [10, 20]),
                            updatedCells[`${token.id}-hits1m`] && "bg-accent"
                          )}
                        >
                          {token.hits1m}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(token.hits5m, [30, 60]),
                            updatedCells[`${token.id}-hits5m`] && "bg-accent"
                          )}
                        >
                          {token.hits5m}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(token.hits15m, [100, 150]),
                            updatedCells[`${token.id}-hits15m`] && "bg-accent"
                          )}
                        >
                          {token.hits15m}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={token.banned ? "destructive" : "outline"}
                          >
                            {token.banned ? "Banned" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleBan(token.id)}
                              >
                                {token.banned ? (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    <span>Unban Token</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    <span>Ban Token</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                <span>Reset Statistics</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User tabs */}
        <TabsContent value="user">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Monitor and manage user accounts and suspicious activity
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isLiveUpdating ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    <Activity
                      className={cn(
                        "h-3 w-3 mr-1",
                        isLiveUpdating && "animate-pulse text-green-500"
                      )}
                    />
                    {isLiveUpdating ? "Live" : "Paused"}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatLastUpdated()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLiveUpdates}
                  >
                    <Activity
                      className={cn(
                        "h-4 w-4 mr-2",
                        isLiveUpdating && "text-green-500"
                      )}
                    />
                    {isLiveUpdating ? "Pause Updates" : "Resume Updates"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshUsers}
                    disabled={isLoadingUsers}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4 mr-2",
                        isLoadingUsers && "animate-spin"
                      )}
                    />
                    {isLoadingUsers ? "Refreshing..." : "Refresh Data"}
                  </Button>
                </div>
              </div>

              {isLoadingUsers && (
                <div className="flex justify-center items-center p-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">
                    Loading user data...
                  </p>
                </div>
              )}
              {usersError && !isLoadingUsers && (
                <div className="flex flex-col justify-center items-center p-10 text-destructive">
                  <ShieldAlert className="h-8 w-8 mb-2" />
                  <p>Error: {usersError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshUsers}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              {!isLoadingUsers && !usersError && users.length === 0 && (
                <div className="flex flex-col justify-center items-center p-10 text-muted-foreground">
                  <User className="h-8 w-8 mb-2" />
                  <p>No user data found.</p>
                </div>
              )}

              <div className="rounded-md border">
                <Table className="bg-background/30">
                  <TableHeader className="bg-background/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-center">Concurrents</TableHead>
                      <TableHead className="text-center">Hits/1m</TableHead>
                      <TableHead className="text-center">Hits/5m</TableHead>
                      <TableHead className="text-center">Hits/15m</TableHead>
                      <TableHead className="text-center">Banned</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className={cn(
                          "group",
                          index % 2 === 0
                            ? "bg-background/20"
                            : "bg-background/10"
                        )}
                      >
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(user.concurrents, [3, 5]),
                            updatedCells[`${user.id}-concurrents`] &&
                              "bg-accent"
                          )}
                        >
                          {user.concurrents}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(user.hits1m, [10, 20]),
                            updatedCells[`${user.id}-hits1m`] && "bg-accent"
                          )}
                        >
                          {user.hits1m}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(user.hits5m, [30, 60]),
                            updatedCells[`${user.id}-hits5m`] && "bg-accent"
                          )}
                        >
                          {user.hits5m}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-center transition-colors duration-500",
                            getStatusColor(user.hits15m, [100, 150]),
                            updatedCells[`${user.id}-hits15m`] && "bg-accent"
                          )}
                        >
                          {user.hits15m}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              user.apiStatus === "banned"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {user.apiStatus === "banned" ? "Banned" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Bot className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Lock className="h-4 w-4" />
                              <span className="sr-only">Lock</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <LockOpen className="h-4 w-4" />
                              <span className="sr-only">Stats</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* policy table */}
        <TabsContent value="policy">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Policy Configuration</CardTitle>
              <CardDescription>
                Configure token validation policies and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Policy Configuration
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This tab would contain policy configuration options and
                    thresholds.
                  </p>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
