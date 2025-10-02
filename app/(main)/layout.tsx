"use client";
import { Toaster } from "sonner";
// import Nav from "../../components/Nav";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import NotificationHandler from "@/components/NotificationHandler";
// import { TrialExpiredModal } from "@/components/sub/TrialExpired";
// import { TrialRemainingModal } from "@/components/sub/TrialRemainingComp";
// import { useCheckTrial } from "@/hooks/useCheckTrials";
// import { useInitialBanCheck } from "@/hooks/useInitialBanStatus";
// import { useBannedRedirect } from "@/hooks/useBannedRefirect";

const MainLayout = ({
  contact,
  children,
}: Readonly<{
  children: React.ReactNode;
  contact: React.ReactNode;
}>) => {
  // Check ban status immediately on first render
  // useInitialBanCheck();

  // Then set up ongoing ban status monitoring
  // useBannedRedirect();
  // const { user: myuser } = useCurrentUser();
  const { user } = useUser();
  // useCheckTrial(myuser?.user);
  const transformedUser = useMemo(() => {
    if (!user) return null;
    return {
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
      username: user.username ?? undefined,
      emailAddresses: user.emailAddresses,
      phoneNumbers: user.phoneNumbers,
    };
  }, [user]);
  // useEffect(() => {
  //   if (!user || !myuser) return;
  //   localStorage.setItem("tier", JSON.stringify(myuser?.user?.tier));

  //   // Transform the user data as needed
  //   if (
  //     myuser?.user?.isMusician === true ||
  //     (myuser?.user?.isClient === true &&
  //       myuser?.user?.city &&
  //       myuser?.user?.talentbio)
  //   ) {
  //     // Transform the user data as needed

  //     // Send to your backend API
  //     fetch("/api/user/register", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ transformedUser }),
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           console.error("Failed to register user");
  //         }
  //         return response.json();
  //       })
  //       .catch((error) => {
  //         console.error("Error registering user:", error);
  //       });
  //   }
  // }, [user]); // This effect runs when the user object changes

  return (
    <div className="h-screen overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          className: "toast",
        }}
      />
      {/* <Nav />
      <NotificationHandler /> <TrialExpiredModal />
      <TrialRemainingModal /> */}
      {contact}
      {children}
    </div>
  );
};

export default MainLayout;
