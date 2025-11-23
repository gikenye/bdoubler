"use client";

import { useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { Input } from "../input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Label } from "../label";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  useNextGroupId,
  useGetGroupSummary,
  useGetGroupState,
  GroupState,
  useCreateGroup,
  useJoinGroup,
  TokenType,
} from "../../../hooks/useFocusStaking";

interface CreateRoomFormData {
  stakeAmount: string;
  maxParticipants: string;
  sessionDuration: string;
  maxInactivity: string;
}

/**
 * CreateRoomDialog component for creating new focus staking groups.
 */
function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const { createGroup, isPending, isConfirming, isConfirmed, error } =
    useCreateGroup();
  const { refetch: refetchNextGroupId } = useNextGroupId();

  const form = useForm<CreateRoomFormData>({
    defaultValues: {
      stakeAmount: "",
      maxParticipants: "",
      sessionDuration: "",
      maxInactivity: "",
    },
  });

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      const stakeAmount = parseEther(data.stakeAmount);
      const maxSize = BigInt(data.maxParticipants);
      const sessionDuration = BigInt(data.sessionDuration) * 60n; // Convert minutes to seconds
      const maxInactivity = BigInt(data.maxInactivity);

      await createGroup(
        TokenType.NATIVE,
        "0x0000000000000000000000000000000000000000" as `0x${string}`, // Zero address for NATIVE
        stakeAmount,
        maxSize,
        sessionDuration,
        maxInactivity
      );
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  // Handle success
  useMemo(() => {
    if (isConfirmed) {
      setOpen(false);
      form.reset();
      refetchNextGroupId(); // Refresh the groups list
    }
  }, [isConfirmed, setOpen, form, refetchNextGroupId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4">Create Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Focus Room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stakeAmount"
              rules={{
                required: "Stake amount is required",
                min: { value: 0.001, message: "Minimum stake is 0.001 CELO" },
                max: { value: 10, message: "Maximum stake is 10 CELO" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stake Amount (CELO)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              rules={{
                required: "Max participants is required",
                min: { value: 2, message: "Minimum 2 participants" },
                max: { value: 50, message: "Maximum 50 participants" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Participants</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionDuration"
              rules={{
                required: "Session duration is required",
                min: { value: 1, message: "Minimum 1 minute" },
                max: { value: 480, message: "Maximum 480 minutes (8 hours)" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxInactivity"
              rules={{
                required: "Max inactivity is required",
                min: { value: 30, message: "Minimum 30 seconds" },
                max: { value: 3600, message: "Maximum 3600 seconds (1 hour)" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Inactivity (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="300" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || isConfirming}
                className="flex-1"
              >
                {isPending
                  ? "Creating..."
                  : isConfirming
                    ? "Confirming..."
                    : "Create Room"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                Failed to create room: {error.message}
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateRoomDialog };

/**
 * SearchFilters component for filtering session groups.
 */
function SearchFilters({
  searchTerm,
  setSearchTerm,
  stakeMin,
  setStakeMin,
  stakeMax,
  setStakeMax,
  sizeMin,
  setSizeMin,
  sizeMax,
  setSizeMax,
  durationMin,
  setDurationMin,
  durationMax,
  setDurationMax,
  statusFilter,
  setStatusFilter,
  onClear,
}: {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  stakeMin: string;
  setStakeMin: (s: string) => void;
  stakeMax: string;
  setStakeMax: (s: string) => void;
  sizeMin: string;
  setSizeMin: (s: string) => void;
  sizeMax: string;
  setSizeMax: (s: string) => void;
  durationMin: string;
  setDurationMin: (s: string) => void;
  durationMax: string;
  setDurationMax: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onClear: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          Filters{" "}
          {isOpen ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">
        <div>
          <Label>Search sessions</Label>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sessions..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Stake Min (CELO)</Label>
            <Input
              type="number"
              step="0.001"
              value={stakeMin}
              onChange={(e) => setStakeMin(e.target.value)}
            />
          </div>
          <div>
            <Label>Stake Max (CELO)</Label>
            <Input
              type="number"
              step="0.001"
              value={stakeMax}
              onChange={(e) => setStakeMax(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Group Size Min</Label>
            <Input
              type="number"
              value={sizeMin}
              onChange={(e) => setSizeMin(e.target.value)}
            />
          </div>
          <div>
            <Label>Group Size Max</Label>
            <Input
              type="number"
              value={sizeMax}
              onChange={(e) => setSizeMax(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration Min (minutes)</Label>
            <Input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
          </div>
          <div>
            <Label>Duration Max (minutes)</Label>
            <Input
              type="number"
              value={durationMax}
              onChange={(e) => setDurationMax(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Forming">Forming</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onClear} variant="outline">
          Clear Filters
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * GroupCard component displays information about a focus staking group.
 */
function GroupCard({
  groupId,
  filter,
}: {
  groupId: bigint;
  filter: (groupId: bigint, summary: any, state: GroupState) => boolean;
}) {
  const { address } = useAccount();
  const {
    groupSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetGroupSummary(groupId);
  const {
    groupState,
    isLoading: stateLoading,
    error: stateError,
  } = useGetGroupState(groupId);
  const {
    joinGroup,
    isPending,
    isConfirming,
    isConfirmed,
    error: joinError,
  } = useJoinGroup();

  const isLoading = summaryLoading || stateLoading;
  const error = summaryError || stateError;

  const statusText = useMemo(() => {
    if (groupState === GroupState.CREATED) return "Created";
    if (groupState === GroupState.STARTED) return "Started";
    if (groupState === GroupState.FINALIZED) return "Finalized";
    return "Unknown";
  }, [groupState]);

  const statusVariant = useMemo(() => {
    if (groupState === GroupState.CREATED) return "outline";
    if (groupState === GroupState.STARTED) return "default";
    if (groupState === GroupState.FINALIZED) return "secondary";
    return "secondary";
  }, [groupState]);

  // Check if user can join
  const canJoin = useMemo(() => {
    if (
      !groupSummary ||
      !address ||
      groupState === GroupState.STARTED ||
      groupState === GroupState.FINALIZED
    )
      return false;
    return groupSummary.joinedCount < groupSummary.maxSize;
  }, [groupSummary, address, groupState]);

  // Handle join button click
  const handleJoin = async () => {
    if (!groupSummary || !canJoin) return;
    try {
      await joinGroup(groupId, groupSummary.stakeAmount);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  // Refresh data after successful join
  useMemo(() => {
    if (isConfirmed) {
      refetchSummary();
    }
  }, [isConfirmed, refetchSummary]);

  if (isLoading) {
    return (
      <Card className="rpg-window">
        <CardHeader>
          <CardTitle className="rpg-title">
            Group #{groupId.toString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !groupSummary) {
    return (
      <Card className="rpg-window">
        <CardHeader>
          <CardTitle className="rpg-title">
            Group #{groupId.toString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="rpg-text text-destructive">Failed to load group data</p>
        </CardContent>
      </Card>
    );
  }

  if (groupState && !filter(groupId, groupSummary, groupState)) return null;

  const stakeAmountEth = formatEther(groupSummary.stakeAmount);
  const durationMinutes = Number(groupSummary.sessionDuration) / 60;

  // Determine button text and state
  const getButtonText = () => {
    if (isPending) return "Joining...";
    if (isConfirming) return "Confirming...";
    if (isConfirmed) return "Joined!";
    return "Join Group";
  };

  const getButtonDisabled = () => {
    return !canJoin || isPending || isConfirming || isConfirmed;
  };

  // Determine message to show
  const getMessage = () => {
    if (joinError)
      return { text: `Failed to join: ${joinError.message}`, type: "error" };
    if (isConfirmed)
      return { text: "Successfully joined the group!", type: "success" };
    if (!address)
      return { text: "Please connect your wallet to join", type: "info" };
    if (groupState === GroupState.STARTED)
      return { text: "Group has already started", type: "info" };
    if (groupState === GroupState.FINALIZED)
      return { text: "Group has been finalized", type: "info" };
    if (groupSummary && groupSummary.joinedCount >= groupSummary.maxSize)
      return { text: "Group is full", type: "info" };
    return null;
  };

  const message = getMessage();

  return (
    <Card className="rpg-window">
      <CardHeader>
        <CardTitle className="rpg-title">Group #{groupId.toString()}</CardTitle>
        <Badge variant={statusVariant}>{statusText}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="rpg-text">
          <strong className="rpg-label">Stake:</strong> {stakeAmountEth} CELO
        </p>
        <p className="rpg-text">
          <strong className="rpg-label">Max Size:</strong>{" "}
          {groupSummary.maxSize.toString()}
        </p>
        <p className="rpg-text">
          <strong className="rpg-label">Duration:</strong> {durationMinutes}{" "}
          minutes
        </p>
        <p className="rpg-text">
          <strong className="rpg-label">Participants:</strong>{" "}
          {groupSummary.joinedCount.toString()} /{" "}
          {groupSummary.maxSize.toString()}
        </p>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleJoin}
          disabled={getButtonDisabled()}
        >
          {getButtonText()}
        </Button>
        {message && (
          <p
            className={`text-sm text-center mt-2 ${
              message.type === "error"
                ? "text-destructive"
                : message.type === "success"
                  ? "text-green-600"
                  : "text-muted-foreground"
            }`}
          >
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * SessionRooms component displays a list of available focus staking groups.
 */
export function SessionRooms() {
  const { nextGroupId, isLoading, error } = useNextGroupId();

  const groupIds = useMemo(() => {
    if (!nextGroupId) return [];
    return Array.from({ length: Number(nextGroupId) }, (_, i) => BigInt(i));
  }, [nextGroupId]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [stakeMin, setStakeMin] = useState("");
  const [stakeMax, setStakeMax] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const clearFilters = () => {
    setSearchTerm("");
    setStakeMin("");
    setStakeMax("");
    setSizeMin("");
    setSizeMax("");
    setDurationMin("");
    setDurationMax("");
    setStatusFilter("All");
  };

  const filterGroup = (groupId: bigint, summary: any, state: GroupState) => {
    if (
      searchTerm &&
      !`Group #${groupId}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    const stakeEth = parseFloat(formatEther(summary.stakeAmount));
    if (stakeMin && stakeEth < parseFloat(stakeMin)) return false;
    if (stakeMax && stakeEth > parseFloat(stakeMax)) return false;
    if (sizeMin && Number(summary.maxSize) < parseInt(sizeMin)) return false;
    if (sizeMax && Number(summary.maxSize) > parseInt(sizeMax)) return false;
    const durationMinNum = durationMin ? parseFloat(durationMin) : null;
    if (durationMinNum && Number(summary.sessionDuration) / 60 < durationMinNum)
      return false;
    const durationMaxNum = durationMax ? parseFloat(durationMax) : null;
    if (durationMaxNum && Number(summary.sessionDuration) / 60 > durationMaxNum)
      return false;
    if (statusFilter !== "All") {
      const statusMap = {
        Forming: GroupState.CREATED,
        Active: GroupState.STARTED,
        Ended: GroupState.FINALIZED,
      };
      if (state !== statusMap[statusFilter as keyof typeof statusMap])
        return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className="rpg-window space-y-4">
        <h3 className="rpg-title text-lg font-semibold">Available Groups</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rpg-window space-y-4">
        <h3 className="rpg-title text-lg font-semibold">Available Groups</h3>
        <p className="rpg-text text-destructive">Failed to load groups</p>
      </div>
    );
  }

  return (
    <div className="rpg-window space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="rpg-title text-lg font-semibold">Available Groups</h3>
        <CreateRoomDialog />
      </div>
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stakeMin={stakeMin}
        setStakeMin={setStakeMin}
        stakeMax={stakeMax}
        setStakeMax={setStakeMax}
        sizeMin={sizeMin}
        setSizeMin={setSizeMin}
        sizeMax={sizeMax}
        setSizeMax={setSizeMax}
        durationMin={durationMin}
        setDurationMin={setDurationMin}
        durationMax={durationMax}
        setDurationMax={setDurationMax}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClear={clearFilters}
      />
      {groupIds.length === 0 ? (
        <p className="rpg-text">No groups available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupIds.map((groupId) => (
            <GroupCard
              key={groupId.toString()}
              groupId={groupId}
              filter={filterGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
