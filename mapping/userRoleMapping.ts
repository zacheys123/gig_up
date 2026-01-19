// utils/userRoleMatching.ts

import { instrumentRoleMappings } from "./instrementMapping";

interface User {
  _id: string;
  roleType?: string;
  instruments?: string[];
  skills?: string[];
  // Add other user fields
}

interface BandRole {
  role: string;
  filledSlots: number;
  maxSlots: number;
  requiredSkills?: string[];
}

export const isUserQualifiedForRole = (
  user: User,
  bandRole: BandRole
): boolean => {
  // If role has no specific requirements, anyone can apply
  if (!bandRole.requiredSkills || bandRole.requiredSkills.length === 0) {
    return true;
  }

  // Get all user skills in lowercase for easy comparison
  const userSkills: string[] = [];

  // Add role type
  if (user.roleType) {
    userSkills.push(user.roleType.toLowerCase());
  }

  // Add instruments
  if (user.instruments) {
    userSkills.push(...user.instruments.map((i) => i.toLowerCase()));
  }

  // Add other skills
  if (user.skills) {
    userSkills.push(...user.skills.map((s) => s.toLowerCase()));
  }

  // Check if user has ANY of the required skills
  const requiredSkills = bandRole.requiredSkills.map((skill) =>
    skill.toLowerCase()
  );

  return userSkills.some((userSkill) =>
    requiredSkills.some(
      (requiredSkill) =>
        userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)
    )
  );
};

export const getAvailableRolesForUser = (
  user: User,
  bandRoles: BandRole[]
): BandRole[] => {
  return bandRoles.filter(
    (role) =>
      role.filledSlots < role.maxSlots && isUserQualifiedForRole(user, role)
  );
};
