export const MEMBER_ROLES = [
  "student",
  "alumni",
  "faculty",
  "management",
  "parent",
  "entrepreneur",
  "wellwisher",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export const MEMBER_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export function isMemberRole(v: unknown): v is MemberRole {
  return typeof v === "string" && (MEMBER_ROLES as readonly string[]).includes(v);
}

export function isMemberStatus(v: unknown): v is MemberStatus {
  return typeof v === "string" && (MEMBER_STATUSES as readonly string[]).includes(v);
}

/** Roles that get a batch-year field during setup. */
export const ROLES_WITH_BATCH_YEAR: MemberRole[] = ["student", "alumni"];

export const roleMeta: Record<
  MemberRole,
  { label: string; blurb: string; badge: string; dot: string }
> = {
  student: {
    label: "Student",
    blurb: "Currently studying at a Crescent institution",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    dot: "bg-blue-500",
  },
  alumni: {
    label: "Alumni",
    blurb: "Graduated from a Crescent institution",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    dot: "bg-amber-500",
  },
  faculty: {
    label: "Faculty",
    blurb: "Teaching or researching within the network",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    dot: "bg-emerald-500",
  },
  management: {
    label: "Management",
    blurb: "Leading or administering an institution",
    badge: "bg-crescent-50 text-crescent-800 ring-1 ring-inset ring-crescent-200",
    dot: "bg-crescent-700",
  },
  parent: {
    label: "Parent",
    blurb: "Parent or guardian of a Crescent student",
    badge: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
    dot: "bg-teal-500",
  },
  entrepreneur: {
    label: "Entrepreneur",
    blurb: "Building a venture, hiring or partnering",
    badge: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
    dot: "bg-purple-500",
  },
  wellwisher: {
    label: "Well-wisher",
    blurb: "Supporting the Crescent mission",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300",
    dot: "bg-slate-500",
  },
};

export const statusMeta: Record<MemberStatus, { label: string; badge: string }> = {
  pending: {
    label: "Pending review",
    badge: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  },
  approved: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  rejected: {
    label: "Not approved",
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
  suspended: {
    label: "Suspended",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300",
  },
};
