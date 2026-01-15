// components/booking/BookingOptionsSection.tsx
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MessageSquare,
  CheckCircle,
  Users,
  Crown,
  User,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingOptionsSectionProps {
  gigId: Id<"gigs">;
  clerkId: string;
  gig: any; // The gig object
  musiciansCount: number;
}

export const BookingOptionsSection: React.FC<BookingOptionsSectionProps> = ({
  gigId,
  clerkId,
  gig,
  musiciansCount,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    "bookOnly" | "bookAndChat" | null
  >(null);
  const [clientRole, setClientRole] = useState<"admin" | "member">("admin");

  // Queries
  const canCreateChat = useQuery(api.controllers.bandChats.canCreateCrewChat, {
    gigId,
    clerkId,
  });

  // Mutations
  const bookAndCreateChat = useMutation(
    api.controllers.prebooking.bookAndCreateCrewChat
  );

  // Check if all roles are filled
  const allRolesFilled = gig.bandCategory?.every(
    (role: any) => role.filledSlots >= role.maxSlots
  );

  if (!allRolesFilled) return null;

  const handleBookOnly = async () => {
    setIsLoading(true);
    try {
      // Gig is already booked via individual bookMusician calls
      // This is just a confirmation action

      toast.success("✅ Gig booked successfully!", {
        description: `All ${musiciansCount} musicians have been notified.`,
      });
    } catch (error: any) {
      toast.error("Failed to book gig", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAndCreateChat = async () => {
    setIsLoading(true);
    setSelectedOption("bookAndChat");
    try {
      const result = await bookAndCreateChat({
        gigId,
        clerkId,
        clientRole,
      });

      if (result.success) {
        toast.success("🎉 Gig booked and crew chat created!", {
          description: `You are the ${clientRole}. Redirecting to chat...`,
        });

        // Redirect to chat after a brief delay
        setTimeout(() => {
          router.push(`/chat/${result.chatId}`);
        }, 1500);
      }
    } catch (error: any) {
      toast.error("Failed to create crew chat", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          🎉 All Band Roles Filled!
        </h2>
        <p className="text-gray-600 mt-2">
          Your band is complete with {musiciansCount} musicians across{" "}
          {gig.bandCategory.length} roles
        </p>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {gig.bandCategory.length}
            </div>
            <div className="text-sm text-green-600 flex items-center justify-center gap-2 mt-1">
              <Users className="w-4 h-4" />
              Band Roles
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {musiciansCount}
            </div>
            <div className="text-sm text-blue-600 flex items-center justify-center gap-2 mt-1">
              <User className="w-4 h-4" />
              Musicians
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {gig.isTaken ? "Booked" : "Ready"}
            </div>
            <div className="text-sm text-purple-600 flex items-center justify-center gap-2 mt-1">
              <CheckCircle className="w-4 h-4" />
              Status
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gig Quick Info */}
      <Card className="border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(gig.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="font-medium truncate">
                  {gig.location || "Not specified"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Total Budget</div>
                <div className="font-medium">
                  {gig.bandCategory.reduce(
                    (total: number, role: any) =>
                      total +
                      (role.bookedPrice || role.price || 0) *
                        (role.bookedUsers?.length || 0),
                    0
                  )}{" "}
                  {gig.currency || "KES"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Chat Status</div>
                <div className="font-medium">
                  {gig.bandChatId ? "Created" : "Not Created"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Book Only */}
        <Card
          className={`border-2 transition-all duration-200 ${selectedOption === "bookOnly" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Book Musicians Only</h3>
                  <p className="text-sm text-gray-500">
                    Mark gig as officially booked
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Marks gig as officially booked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Notifies all {musiciansCount} musicians</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 text-gray-400">○</div>
                  <span className="text-gray-500">No chat room created</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Can create chat later if needed</span>
                </li>
              </ul>

              <Button
                onClick={handleBookOnly}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading && selectedOption === "bookOnly" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "✅ Book Gig Only"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: Book & Create Chat */}
        <Card
          className={`border-2 transition-all duration-200 ${selectedOption === "bookAndChat" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Book & Create Crew Chat</h3>
                  <p className="text-sm text-gray-500">
                    Book gig + team chat room
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <p className="font-medium text-sm">Your role in crew chat:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setClientRole("admin")}
                    className={`p-3 rounded-lg text-sm transition-all ${clientRole === "admin" ? "bg-blue-100 text-blue-700 border-2 border-blue-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Crown className="w-4 h-4" />
                      <span>Be Admin</span>
                    </div>
                    <div className="text-xs mt-1">Can manage chat</div>
                  </button>
                  <button
                    onClick={() => setClientRole("member")}
                    className={`p-3 rounded-lg text-sm transition-all ${clientRole === "member" ? "bg-blue-100 text-blue-700 border-2 border-blue-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Users className="w-4 h-4" />
                      <span>Be Member</span>
                    </div>
                    <div className="text-xs mt-1">Equal permissions</div>
                  </button>
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Marks gig as officially booked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Creates crew chat room</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Adds all {musiciansCount} musicians</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sends notifications to everyone</span>
                </li>
              </ul>

              <Button
                onClick={handleBookAndCreateChat}
                disabled={isLoading || !canCreateChat?.canCreate}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isLoading && selectedOption === "bookAndChat" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "🚀 Book & Create Crew Chat"
                )}
              </Button>

              {canCreateChat && !canCreateChat.canCreate && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {canCreateChat.reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
