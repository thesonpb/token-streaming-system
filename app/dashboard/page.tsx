"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Lock,
    Bot,
    LockOpen,
    BotOff,
    Loader2,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/use-user-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePolicyData } from "@/hooks/use-policy-data";
import { HistoryLogItem } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import useHistory from "@/hooks/use-history";
import useGeo from "@/hooks/use-geo";
import { API_BASE_URL, AUTH } from "@/constants";

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { username } = useUserStore();
    const { data, loading, fail, refetch } = useHistory({
        pollingInterval: 5000,
    });
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
        autoPolicyToToken,
    } = useUserData();
    const [actionStatus, setActionStatus] = useState<{
        [key: string]: string | null;
    }>({});
    const [isApplyingPolicy, setIsApplyingPolicy] = useState<string | null>(
        null
    );
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("token");
    const [updatedCells] = useState<{ [key: string]: boolean }>({});

    const {
        policies,
        isLoading,
        error,
        fetchPolicies,
        enablePolicy,
        disablePolicy,
    } = usePolicyData();

    const [isActionInProgress, setIsActionInProgress] = useState<
        Record<string, boolean>
    >({});

    const handleEnablePolicy = async (policyId: string) => {
        setIsActionInProgress((prev) => ({ ...prev, [policyId]: true }));
        await enablePolicy(policyId);
        setIsActionInProgress((prev) => ({ ...prev, [policyId]: false }));
    };

    const handleDisablePolicy = async (policyId: string) => {
        setIsActionInProgress((prev) => ({ ...prev, [policyId]: true }));
        await disablePolicy(policyId);
        setIsActionInProgress((prev) => ({ ...prev, [policyId]: false }));
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !username) {
            router.push("/");
        }
    }, [mounted, username, router]);

    if (loading && !data) {
        return <p>Loading history logs...</p>;
    }

    if (fail && !data) {
        return (
            <div>
                <p>Error fetching history logs: {fail.message}</p>
                <button onClick={() => refetch()}>Try Again</button>
            </div>
        );
    }

    if (isLoading) {
        return <p>Loading mitigation strategies...</p>;
    }

    if (error) {
        return <p>Error loading policies: {error}</p>;
    }

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
            const response = await fetch(`${API_BASE_URL}/BanToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${AUTH}`,
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

    const handleUnbanUserToken = async (
        tokenId: string,
        tokenUsername: string
    ) => {
        const payload = {
            token: tokenId,
            token_claim: "access-video",
            request_useragent: "TestAgent",
            request_ip: "1.1.1.1",
            request_hostname: "cdn.test",
            request_path: "/bad.mp4",
        };

        try {
            const response = await fetch(`${API_BASE_URL}/UnbanToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${AUTH}`,
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

    const getStatusColor = (value: number, thresholds: [number, number]) => {
        const [warning, critical] = thresholds;
        if (value >= critical) return "text-destructive";
        if (value >= warning) return "text-amber-500";
        return "text-green-500";
    };

    if (!mounted || !username) return null;

    const formatLogTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl  font-bold">Mitigation Strategy</h1>
            </div>

            <Tabs
                defaultValue="token"
                value={activeTab}
                onValueChange={setActiveTab}
            >
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
                        <CardContent className="pt-10">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Token/User ID</TableHead>
                                            <TableHead className="text-center">
                                                Concurrents
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/1m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/5m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/15m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Status
                                            </TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                className="group"
                                            >
                                                <TableCell className="font-medium">
                                                    {user.id}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.concurrents,
                                                            [3, 5]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-concurrents`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.concurrents}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits1m,
                                                            [60, 120]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits1m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits1m}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits5m,
                                                            [120, 240]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits5m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits5m}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits15m,
                                                            [300, 500]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits15m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits15m}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            user.apiStatus ===
                                                            "banned"
                                                                ? "destructive"
                                                                : "outline"
                                                        }
                                                    >
                                                        {user.apiStatus ===
                                                        "banned"
                                                            ? "Banned"
                                                            : "Active"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="opacity-0 group-hover:opacity-100"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Actions
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {}}
                                                            >
                                                                {user.apiStatus ===
                                                                "banned" ? (
                                                                    <>
                                                                        <Shield className="h-4 w-4 mr-2" />
                                                                        <span>
                                                                            Unban
                                                                            Token
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Ban className="h-4 w-4 mr-2" />
                                                                        <span>
                                                                            Ban
                                                                            Token
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                <span>
                                                                    View Details
                                                                </span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                <span>
                                                                    Reset
                                                                    Statistics
                                                                </span>
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
                        <CardContent className="pt-10">
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
                            {!isLoadingUsers &&
                                !usersError &&
                                users.length === 0 && (
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
                                            <TableHead className="text-center">
                                                Concurrents
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/1m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/5m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Hits/15m
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Banned
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Action
                                            </TableHead>
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
                                                        getStatusColor(
                                                            user.concurrents,
                                                            [3, 5]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-concurrents`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.concurrents}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits1m,
                                                            [60, 120]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits1m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits1m}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits5m,
                                                            [120, 240]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits5m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits5m}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        "text-center transition-colors duration-500",
                                                        getStatusColor(
                                                            user.hits15m,
                                                            [300, 500]
                                                        ),
                                                        updatedCells[
                                                            `${user.id}-hits15m`
                                                        ] && "bg-accent"
                                                    )}
                                                >
                                                    {user.hits15m}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            user.apiStatus ===
                                                            "banned"
                                                                ? "destructive"
                                                                : "outline"
                                                        }
                                                    >
                                                        {user.apiStatus ===
                                                        "banned"
                                                            ? "Banned"
                                                            : "Active"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                handleBanUserToken(
                                                                    user.id,
                                                                    user.username
                                                                )
                                                            }
                                                            disabled={
                                                                user.apiStatus ===
                                                                "banned"
                                                            } // Disable if already banned
                                                            title={
                                                                user.apiStatus ===
                                                                "banned"
                                                                    ? "Token is already banned"
                                                                    : "Ban this user's token"
                                                            }
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Ban Token
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                handleUnbanUserToken(
                                                                    user.id,
                                                                    user.username
                                                                )
                                                            }
                                                            disabled={
                                                                user.apiStatus !==
                                                                "banned"
                                                            } // Enable unban only if currently banned
                                                            title={
                                                                user.apiStatus !==
                                                                "banned"
                                                                    ? "Token is not banned"
                                                                    : "Unban this user's token"
                                                            }
                                                        >
                                                            <LockOpen className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Unban Token
                                                            </span>
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
                                        disabled={
                                            currentPage === 1 || isLoadingUsers
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={
                                            currentPage === totalPages ||
                                            isLoadingUsers
                                        }
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
                        <CardContent className="pt-10">
                            {/* Display a general error message if an action failed after policies were loaded */}
                            {error && policies.length > 0 && (
                                <p className="mb-4 text-sm text-red-600">
                                    Last operation failed: {error}. Data might
                                    be momentarily inconsistent.
                                </p>
                            )}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px] sm:w-[250px]">
                                                Policy ID
                                            </TableHead>
                                            <TableHead>
                                                Policy Description
                                            </TableHead>
                                            <TableHead className="text-center w-[100px]">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-center w-[120px]">
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading && policies.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-24 text-center"
                                                >
                                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                                                    <span className="ml-2">
                                                        Loading...
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ) : policies.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-24 text-center"
                                                >
                                                    No policies found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            policies.map((policy) => (
                                                <TableRow
                                                    key={policy.id}
                                                    className={
                                                        isActionInProgress[
                                                            policy.id
                                                        ]
                                                            ? "opacity-60"
                                                            : ""
                                                    }
                                                >
                                                    <TableCell
                                                        className="font-medium truncate max-w-[250px] sm:max-w-[300px]"
                                                        title={policy.id}
                                                    >
                                                        {policy.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            policy.policyDescription
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {/* Checkbox is now purely informational and effectively read-only */}
                                                        {isActionInProgress[
                                                            policy.id
                                                        ] ? (
                                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                                                        ) : (
                                                            <Checkbox
                                                                checked={
                                                                    policy.enabled
                                                                }
                                                                aria-label={`Policy ${
                                                                    policy.id
                                                                } is ${
                                                                    policy.enabled
                                                                        ? "enabled"
                                                                        : "disabled"
                                                                }`}
                                                                disabled={true}
                                                                className="pointer-events-none"
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isActionInProgress[
                                                            policy.id
                                                        ] ? (
                                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                                                        ) : policy.enabled ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDisablePolicy(
                                                                        policy.id
                                                                    )
                                                                }
                                                                aria-label={`Disable policy ${policy.id}`}
                                                                title="Disable Policy"
                                                                disabled={
                                                                    isLoading ||
                                                                    isActionInProgress[
                                                                        policy
                                                                            .id
                                                                    ]
                                                                }
                                                            >
                                                                <BotOff className="h-5 w-5 text-red-600 hover:text-red-700" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleEnablePolicy(
                                                                        policy.id
                                                                    )
                                                                }
                                                                aria-label={`Enable policy ${policy.id}`}
                                                                title="Enable Policy"
                                                                disabled={
                                                                    isLoading ||
                                                                    isActionInProgress[
                                                                        policy
                                                                            .id
                                                                    ]
                                                                }
                                                            >
                                                                <Bot className="h-5 w-5 text-green-600 hover:text-green-700" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* History Log Component */}
            <Card className="border-border bg-card/50 backdrop-blur">
                <CardHeader>
                    <CardTitle>History Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <h1>
                        {loading && data && (
                            <span
                                style={{
                                    fontSize: "0.7em",
                                    marginLeft: "10px",
                                }}
                            >
                                (Updating...)
                            </span>
                        )}{" "}
                        {/* Subtle update indicator */}
                        {fail && data && (
                            <span
                                style={{
                                    fontSize: "0.7em",
                                    marginLeft: "10px",
                                    color: "orange",
                                }}
                            >
                                (Update failed, showing stale data)
                            </span>
                        )}
                    </h1>
                    <Button
                        onClick={() => refetch()}
                        style={{ marginBottom: "10px" }}
                        disabled={loading}
                        variant="outline"
                        className="text-sm py-1.5"
                    >
                        {loading && !data ? "Loading..." : "Refresh Logs"}
                    </Button>
                    <ScrollArea className="h-72 w-full rounded-md border p-4 bg-background/30">
                        {data?.length > 0 ? (
                            <ul className="space-y-3">
                                {data.map((log: HistoryLogItem) => (
                                    <li key={log.id} className="text-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-foreground/90">
                                                <span className="text-blue-500">
                                                    {formatLogTimestamp(
                                                        log.timestamp
                                                    )}{" "}
                                                    {"> "}
                                                </span>
                                                {log.details}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">
                                No history logs available.
                            </p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
