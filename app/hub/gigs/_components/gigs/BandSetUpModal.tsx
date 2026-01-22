// app/gigs/_components/BandSetUpModal.tsx
"use client";

import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BandRoleInput, BandSetupRole } from "@/types/gig";
import DesktopBandSetupModal from "./DesktopBandSetupModal";
import MobileBandSetupModal from "./MobileBandSetup";

// Update the interface to accept BandRoleInput[] instead of BandSetupRole[]
interface BandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRoleInput[];
  isEditMode?: boolean;
}

const BandSetupModal: React.FC<BandSetupModalProps> = (props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileBandSetupModal {...props} />;
  }

  return <DesktopBandSetupModal {...props} />;
};

export default BandSetupModal;
