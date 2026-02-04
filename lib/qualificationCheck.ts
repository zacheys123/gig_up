// utils/qualificationChecker.ts
import { Id } from "@/convex/_generated/dataModel";

interface UserData {
  _id: Id<"users">;
  roleType?: string;
  instrument?: string;
  vocalistGenre?: string | string[];
  mcType?: string;
  mcLanguages?: string | string[];
  djGenre?: string | string[];
  djEquipment?: string | string[];
  categories?: any[];
}

interface GigData {
  bussinesscat?: string;
  category?: string; // For individual gigs: instrument like "piano", "guitar", etc.
  mcType?: string;
  mcLanguages?: string | string[];
  djGenre?: string | string[];
  djEquipment?: string | string[];
  vocalistGenre?: string | string[];
  bandCategory?: Array<{
    role: string;
    requiredSkills?: string[];
  }>;
}

/**
 * Check if user is qualified for a gig
 */
export function isUserQualifiedForGig(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  if (!gigData.bussinesscat) {
    return {
      isQualified: false,
      reasons: ["Gig has no business category"],
      missingQualifications: ["Business category not specified"],
    };
  }

  switch (gigData.bussinesscat) {
    case "personal":
      return checkIndividualQualification(userData, gigData);

    case "mc":
      return checkMCQualification(userData, gigData);

    case "dj":
      return checkDJQualification(userData, gigData);

    case "vocalist":
      return checkVocalistQualification(userData, gigData);

    case "other":
      return checkBandRoleQualification(userData, gigData);

    case "full":
      // For full band, check general musician qualifications
      return checkFullBandQualification(userData, gigData);

    default:
      return {
        isQualified: false,
        reasons: [`Unknown business category: ${gigData.bussinesscat}`],
        missingQualifications: ["Valid business category"],
      };
  }
}

/**
 * Check qualification for individual musician gigs
 */
function checkIndividualQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Check if user is a musician
  if (
    userData.roleType !== "musician" &&
    userData.roleType !== "instrumentalist"
  ) {
    missingQualifications.push("Not a musician");
    reasons.push("User is not registered as a musician");
  }

  // 2. Check instrument match
  if (gigData.category) {
    const requiredInstrument = gigData.category.toLowerCase();
    const userInstrument = userData.instrument?.toLowerCase() || "";

    if (
      !userInstrument.includes(requiredInstrument) &&
      !requiredInstrument.includes(userInstrument)
    ) {
      missingQualifications.push(`Instrument: ${requiredInstrument}`);
      reasons.push(`Does not play ${requiredInstrument}`);
    } else {
      reasons.push(`Plays ${requiredInstrument}`);
    }
  }

  return {
    isQualified: missingQualifications.length === 0,
    reasons,
    missingQualifications,
  };
}

/**
 * Check qualification for MC gigs
 */
function checkMCQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Check if user is an MC
  if (userData.roleType !== "mc" && userData.roleType !== "entertainer") {
    missingQualifications.push("Not an MC");
    reasons.push("User is not registered as an MC");
  }

  // 2. Check MC type
  if (gigData.mcType) {
    const requiredType = gigData.mcType.toLowerCase();
    const userType = userData.mcType?.toLowerCase() || "";

    if (userType !== requiredType) {
      missingQualifications.push(`MC type: ${requiredType}`);
      reasons.push(`Not a ${requiredType} MC`);
    } else {
      reasons.push(`${requiredType} MC`);
    }
  }

  // 3. Check languages
  if (gigData.mcLanguages) {
    const requiredLangs = Array.isArray(gigData.mcLanguages)
      ? gigData.mcLanguages.map((lang) => lang.toLowerCase())
      : [gigData.mcLanguages.toLowerCase()];

    const userLangs = Array.isArray(userData.mcLanguages)
      ? userData.mcLanguages.map((lang) => lang.toLowerCase())
      : userData.mcLanguages
          ?.toLowerCase()
          ?.split(/[,;]/)
          .map((lang) => lang.trim()) || [];

    const missingLangs = requiredLangs.filter(
      (lang) => !userLangs.includes(lang),
    );

    if (missingLangs.length > 0) {
      missingQualifications.push(`Languages: ${missingLangs.join(", ")}`);
      reasons.push(`Missing language skills: ${missingLangs.join(", ")}`);
    } else {
      reasons.push(`Speaks ${requiredLangs.join(", ")}`);
    }
  }

  return {
    isQualified: missingQualifications.length === 0,
    reasons,
    missingQualifications,
  };
}

/**
 * Check qualification for DJ gigs
 */
function checkDJQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Check if user is a DJ
  if (userData.roleType !== "dj") {
    missingQualifications.push("Not a DJ");
    reasons.push("User is not registered as a DJ");
  }

  // 2. Check genre match
  if (gigData.djGenre) {
    const requiredGenres = Array.isArray(gigData.djGenre)
      ? gigData.djGenre.map((genre) => genre.toLowerCase())
      : [gigData.djGenre.toLowerCase()];

    const userGenres = Array.isArray(userData.djGenre)
      ? userData.djGenre.map((genre) => genre.toLowerCase())
      : userData.djGenre
          ?.toLowerCase()
          ?.split(/[,;]/)
          .map((genre) => genre.trim()) || [];

    const missingGenres = requiredGenres.filter(
      (genre) => !userGenres.includes(genre),
    );

    if (missingGenres.length > 0) {
      missingQualifications.push(`Genres: ${missingGenres.join(", ")}`);
      reasons.push(`Doesn't play ${missingGenres.join(", ")}`);
    } else {
      reasons.push(`Plays ${requiredGenres.join(", ")}`);
    }
  }

  // 3. Check equipment
  if (gigData.djEquipment) {
    const requiredEquipment = Array.isArray(gigData.djEquipment)
      ? gigData.djEquipment.map((eq) => eq.toLowerCase())
      : [gigData.djEquipment.toLowerCase()];

    const userEquipment = Array.isArray(userData.djEquipment)
      ? userData.djEquipment.map((eq) => eq.toLowerCase())
      : userData.djEquipment
          ?.toLowerCase()
          ?.split(/[,;]/)
          .map((eq) => eq.trim()) || [];

    const missingEquipment = requiredEquipment.filter(
      (eq) => !userEquipment.includes(eq),
    );

    if (missingEquipment.length > 0) {
      missingQualifications.push(`Equipment: ${missingEquipment.join(", ")}`);
      reasons.push(`Missing equipment: ${missingEquipment.join(", ")}`);
    } else {
      reasons.push(`Has required equipment`);
    }
  }

  return {
    isQualified: missingQualifications.length === 0,
    reasons,
    missingQualifications,
  };
}

/**
 * Check qualification for vocalist gigs
 */
function checkVocalistQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Check if user is a vocalist
  if (userData.roleType !== "vocalist" && userData.roleType !== "singer") {
    missingQualifications.push("Not a vocalist");
    reasons.push("User is not registered as a vocalist");
  }

  // 2. Check genre match
  if (gigData.vocalistGenre) {
    const requiredGenres = Array.isArray(gigData.vocalistGenre)
      ? gigData.vocalistGenre.map((genre) => genre.toLowerCase())
      : [gigData.vocalistGenre.toLowerCase()];

    const userGenres = Array.isArray(userData.vocalistGenre)
      ? userData.vocalistGenre.map((genre) => genre.toLowerCase())
      : userData.vocalistGenre
          ?.toLowerCase()
          ?.split(/[,;]/)
          .map((genre) => genre.trim()) || [];

    const matchingGenres = requiredGenres.filter((genre) =>
      userGenres.includes(genre),
    );
    const missingGenres = requiredGenres.filter(
      (genre) => !userGenres.includes(genre),
    );

    if (matchingGenres.length === 0) {
      missingQualifications.push(`Genres: ${requiredGenres.join(", ")}`);
      reasons.push(`Doesn't sing ${requiredGenres.join(", ")}`);
    } else if (missingGenres.length > 0) {
      reasons.push(
        `Sings ${matchingGenres.join(", ")} but missing ${missingGenres.join(", ")}`,
      );
    } else {
      reasons.push(`Sings ${requiredGenres.join(", ")}`);
    }
  }

  return {
    isQualified: missingQualifications.length === 0,
    reasons,
    missingQualifications,
  };
}

/**
 * Check qualification for band roles
 */
function checkBandRoleQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  // This is for band roles - we already have this logic
  // You can keep your existing band role qualification logic here
  const reasons: string[] = ["Band role qualification check"];
  const missingQualifications: string[] = [];

  return {
    isQualified: true,
    reasons,
    missingQualifications,
  };
}

/**
 * Check qualification for full band gigs
 */
function checkFullBandQualification(
  userData: UserData,
  gigData: GigData,
): {
  isQualified: boolean;
  reasons: string[];
  missingQualifications: string[];
} {
  const reasons: string[] = [];
  const missingQualifications: string[] = [];

  // Check if user is a musician
  if (
    userData.roleType !== "musician" &&
    userData.roleType !== "instrumentalist"
  ) {
    missingQualifications.push("Not a musician");
    reasons.push("User is not registered as a musician");
  }

  // Check if user has an instrument
  if (!userData.instrument) {
    missingQualifications.push("No instrument specified");
    reasons.push("No instrument in profile");
  } else {
    reasons.push(`Plays ${userData.instrument}`);
  }

  return {
    isQualified: missingQualifications.length === 0,
    reasons,
    missingQualifications,
  };
}

/**
 * Get qualification badge for UI display
 */
export function getQualificationBadge(
  userData: UserData,
  gigData: GigData,
): {
  text: string;
  color: "green" | "yellow" | "red" | "gray";
  tooltip: string;
} {
  const { isQualified, reasons, missingQualifications } = isUserQualifiedForGig(
    userData,
    gigData,
  );

  if (!isQualified) {
    return {
      text: "Not Qualified",
      color: "red",
      tooltip: missingQualifications.join("\n"),
    };
  }

  // Check if partially qualified (has some but not all requirements)
  const isPartial = reasons.some(
    (reason) => reason.includes("but missing") || reason.includes("missing"),
  );

  if (isPartial) {
    return {
      text: "Partially Qualified",
      color: "yellow",
      tooltip: reasons.join("\n"),
    };
  }

  return {
    text: "Qualified",
    color: "green",
    tooltip: reasons.join("\n"),
  };
}
