import Link from "next/link";
import Image from "next/image";
import { roleMeta, type MemberRole } from "@/lib/roles";

export interface DirectoryMember {
  id: string;
  full_name: string;
  role: MemberRole;
  institution_id: string | null;
  institution_name: string | null;
  batch_year: number | null;
  current_city: string | null;
  current_country: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  show_email: boolean;
  show_phone: boolean;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export function Avatar({
  src,
  name,
  size = 72,
  className = "",
}: {
  src: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-crescent-50 ring-1 ring-slate-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold text-crescent-600"
          style={{ fontSize: size * 0.38 }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function MemberCard({ member }: { member: DirectoryMember }) {
  const meta = roleMeta[member.role];
  const location = [member.current_city, member.current_country]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/connect/profile/${member.id}`}
      className="group relative flex h-full flex-col items-center overflow-hidden rounded-card border border-slate-200 bg-gradient-to-b from-white to-sand-50/70 pb-6 pt-0 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-crescent-300 hover:shadow-card-hover"
    >
      {/*
        Tinted crown behind the avatar. Gives the card a top edge to sit
        against so the portrait reads as the subject rather than as an icon
        floating in whitespace, and carries the member's role colour.
      */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-crescent-50 to-transparent"
      />

      <div className="relative mt-6">
        {/* Soft ring bloom on hover — the avatar is the card's subject. */}
        <span
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full bg-crescent-200/0 blur-md transition-colors duration-300 group-hover:bg-crescent-300/40"
        />
        <span className="relative block rounded-full ring-4 ring-white shadow-raised">
          <Avatar src={member.avatar_url} name={member.full_name} size={88} />
        </span>
      </div>

      <div className="w-full px-6">
        <h3 className="mt-4 text-base font-bold leading-snug text-crescent-800">
          {member.full_name}
        </h3>

        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
        >
          {meta.label}
          {member.batch_year ? ` · ${member.batch_year}` : ""}
        </span>

        {member.headline && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {member.headline}
          </p>
        )}
      </div>

      <div className="mt-auto w-full px-6 pt-4">
        {member.institution_name && (
          <p className="truncate border-t border-slate-100 pt-3 text-xs font-semibold text-crescent-600">
            {member.institution_name}
          </p>
        )}
        {location && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{location}</p>
        )}
      </div>
    </Link>
  );
}
