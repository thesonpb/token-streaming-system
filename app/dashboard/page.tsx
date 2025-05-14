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
import { useToast } from "@/hooks/use-toast";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { username } = useUserStore();
  const {
    users,
    allUsersCount,
    isLoading: isLoadingUsers,
    error: usersError,
    fetchUsers,
    updateUser,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useUserData();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("token");
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [updatedCells, setUpdatedCells] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !username) {
      router.push("/");
    }
  }, [mounted, username, router]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBanUserToken = async (tokenId: string, username: string) => {
    const payload = {
      token: tokenId,
      token_claim: "access-video",
      request_useragent: "TestAgent",
      request_ip: "1.1.1.1",
      request_hostname: "cdn.test",
      request_path: "/bad.mp4",
    };

    try {
      const response = await fetch("http://localhost:9926/AdminBanToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `Failed to ban token. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // API call was successful
      toast({
        title: "Token Banned Successfully",
        description: `Token for user '${username}' has been banned.`,
        variant: "destructive",
      });

      updateUser(tokenId, { apiStatus: "banned" });
    } catch (error: any) {
      console.error("Error banning token:", error);
      toast({
        title: "Error Banning Token",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Add this function inside your ManagementPage component, near handleBanUserToken

  const handleUnbanUserToken = async (
    tokenId: string,
    tokenUsername: string
  ) => {
    // The payload is the same as for banning, according to your images
    const payload = {
      token: tokenId,
      token_claim: "access-video", // Placeholder, match your actual needs
      request_useragent: "TestAgent", // Placeholder
      request_ip: "1.1.1.1", // Placeholder
      request_hostname: "cdn.test", // Placeholder
      request_path: "/bad.mp4", // Placeholder
    };

    try {
      const response = await fetch("http://localhost:9926/AdminUnbanToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If body is not JSON or empty
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          `Failed to unban token. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast({
        title: "Token Unbanned Successfully",
        description: `Token for user '${tokenUsername}' has been unbanned.`,
        variant: "default",
      });

      // Update the local user state to reflect the unban
      // Assuming "ok" is the status for an active/unbanned token
      updateUser(tokenId, { apiStatus: "ok" });
    } catch (error: any) {
      console.error("Error unbanning token:", error);
      toast({
        title: "Error Unbanning Token",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshUsers = async () => {
    await fetchUsers(); // Call the fetchUsers from the hook
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
                    {users.map((user) => (
                      <TableRow key={user.id} className="group">
                        <TableCell className="font-medium">{user.id}</TableCell>
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
                                onClick={() => {}}
                              >
                                {user.apiStatus === "banned" ? (
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
                              onClick={() =>
                                alert(`Bot action for ${user.username}`)
                              } // Placeholder
                              title="Bot Action"
                            >
                              <Bot className="h-4 w-4" />
                              <span className="sr-only">Bot Action</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleBanUserToken(user.id, user.username)
                              }
                              disabled={user.apiStatus === "banned"} // Disable if already banned
                              title={
                                user.apiStatus === "banned"
                                  ? "Token is already banned"
                                  : "Ban this user's token"
                              }
                            >
                              <Lock className="h-4 w-4" />
                              <span className="sr-only">Ban Token</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUnbanUserToken(user.id, user.username)
                              }
                              disabled={user.apiStatus !== "banned"} // Enable unban only if currently banned
                              title={
                                user.apiStatus !== "banned"
                                  ? "Token is not banned"
                                  : "Unban this user's token"
                              }
                            >
                              <LockOpen className="h-4 w-4" />
                              <span className="sr-only">Unban Token</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    (Total Users: {allUsersCount})
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoadingUsers}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoadingUsers}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
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
