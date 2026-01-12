// app/gigs/_components/BandSetupModal.tsx
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BandRoleInput, BandSetupRole } from "@/types/gig";
import DesktopBandSetupModal from "./DesktopBandSetupModal";
import MobileBandSetupModal from "./MobileBandSetup";

interface BandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandSetupRole[];
}

const BandSetupModal: React.FC<BandSetupModalProps> = (props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileBandSetupModal {...props} />;
  }

  return <DesktopBandSetupModal {...props} />;
};

export default BandSetupModal;
