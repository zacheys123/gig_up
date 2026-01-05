// app/gigs/_components/BandSetupModal.tsx
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

import { BandRoleInput } from "@/types/gig";
import DesktopBandSetupModal from "./DesktopBandSetupModal";
import MobileBandSetupModal from "./MobileBandSetup";

interface BandRole {
  role: string;
  maxSlots: number;
  requiredSkills: string[];
  description?: string;
  price?: string;
  currency?: string;
  negotiable?: boolean;
}

interface BandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRole[];
}

const BandSetupModal: React.FC<BandSetupModalProps> = (props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileBandSetupModal {...props} />;
  }

  return <DesktopBandSetupModal {...props} />;
};

export default BandSetupModal;
