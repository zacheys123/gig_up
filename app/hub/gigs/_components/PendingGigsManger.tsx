// components/gigs/PendingGigsManager.tsx
import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import the different versions
import { ClientPreBooking } from "./ClientPreBooking";
import { MusicianPreBooking } from "./MusicianPendingGigs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BandPendingGigs } from "./BandPendingGigs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGigs } from "@/hooks/useAllGigs";

interface PendingGigsManagerProps {
  initialUser?: any;
}

export const PendingGigsManager: React.FC<PendingGigsManagerProps> = ({
  initialUser,
}) => {
  const { userId } = useAuth();
  const [bandApplicationCount, setBandApplicationCount] = useState(0);

  // Get current user data
  const { user: userData } = useCurrentUser();
  const { gigs: allGigs } = useGigs();

  // Count band applications (appliedBy in bookCount)
  useEffect(() => {
    if (!userData?._id || !allGigs) return;

    let count = 0;
    for (const gig of allGigs) {
      if (gig.bookCount && gig.bookCount.length > 0) {
        const userApplications = gig.bookCount.filter(
          (app: any) => app.appliedBy === userData._id
        );
        count += userApplications.length;
      }
    }
    setBandApplicationCount(count);
  }, [userData?._id, allGigs]);

  const user = userData || initialUser;

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Check if user is both musician and band leader
  const isMusician = user.isMusician;

  // User is a band leader if:
  // 1. They have band applications (appliedBy in bookCount) - OR -
  // 2. They have bands in their bandLeaderOf array
  const hasBandApplications = bandApplicationCount > 0;
  const hasBandLeaderOf = user.bandLeaderOf && user.bandLeaderOf.length > 0;
  const isUserBandLeader = hasBandApplications || hasBandLeaderOf;

  // Determine which component to show
  if (isMusician && isUserBandLeader) {
    // Musicians who are also band leaders
    return (
      <div className="space-y-6">
        {/* Band Leader Info Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xl">🎸</span>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900">Band Leader</h4>
                <div className="flex gap-4 text-sm text-indigo-700">
                  {hasBandApplications && (
                    <span>
                      <span className="font-bold">{bandApplicationCount}</span>{" "}
                      gig applications
                    </span>
                  )}
                  {hasBandLeaderOf && (
                    <span>
                      <span className="font-bold">
                        {user.bandLeaderOf.length}
                      </span>{" "}
                      bands led
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white">Band Leader</Badge>
          </div>
        </div>

        {/* Tabs for Solo vs Band Applications */}
        <Tabs defaultValue="musician">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="musician">
              <span className="flex items-center gap-2">
                🎵 Solo Applications
              </span>
            </TabsTrigger>
            <TabsTrigger value="band">
              <span className="flex items-center gap-2">
                🎸 Band Applications
                {bandApplicationCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {bandApplicationCount}
                  </Badge>
                )}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="musician">
            <MusicianPreBooking user={user} />
          </TabsContent>
          <TabsContent value="band">
            <BandPendingGigs user={user} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } else if (isMusician) {
    // Just a musician (not band leader)
    return <MusicianPreBooking user={user} />;
  } else if (user.isClient) {
    // Client user
    return <ClientPreBooking user={user} />;
  } else if (isUserBandLeader) {
    // Band leader only (not musician)
    return (
      <>
        {/* Band Leader Info Banner for non-musicians */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xl">🎸</span>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900">
                  Band Leader Dashboard
                </h4>
                <div className="flex gap-4 text-sm text-indigo-700">
                  {hasBandApplications && (
                    <span>
                      Applied to{" "}
                      <span className="font-bold">{bandApplicationCount}</span>{" "}
                      gigs
                    </span>
                  )}
                  {hasBandLeaderOf && (
                    <span>
                      Leads{" "}
                      <span className="font-bold">
                        {user.bandLeaderOf.length}
                      </span>{" "}
                      bands
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white">Band Leader</Badge>
          </div>
        </div>
        <BandPendingGigs user={user} />
      </>
    );
  } else {
    // Default fallback
    return (
      <Card className="text-center py-12">
        <CardContent>
          <h3 className="text-xl font-semibold mb-2">No Active Role</h3>
          <p className="text-gray-500">
            Update your profile to musician or client to view gig applications
          </p>
        </CardContent>
      </Card>
    );
  }
};
