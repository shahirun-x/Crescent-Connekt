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
      className="group flex h-full flex-col items-center rounded-card border border-slate-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-crescent-300 hover:shadow-lg"
    >
      <Avatar src={member.avatar_url} name={member.full_name} size={80} />

      <h3 className="mt-4 text-base font-bold leading-snug text-crescent-800 group-hover:text-crescent-900">
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

      <div className="mt-auto w-full pt-4">
        {member.institution_name && (
          <p className="truncate text-xs font-medium text-crescent-600">
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
