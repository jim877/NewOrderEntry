// @ts-nocheck
import React from "react";
import { RoleIcon } from "./RoleIcon";

// RoleBadge — sky-tinted pill showing a role title with its matching icon.
export const RoleBadge = ({ role }) => (
  <span
    title={role.title}
    className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700"
  >
    <RoleIcon role={role} className="h-3 w-3" />
    {role.title}
  </span>
);
