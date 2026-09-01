"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { UserRole } from "@/types/database";

interface UserRowActionsProps {
  userId: string;
  currentRole: UserRole;
  selfId: string;
}

export function UserRowActions({ userId, currentRole, selfId }: UserRowActionsProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isSelf = userId === selfId;

  async function handleRoleChange(newRole: string | null) {
    if (!newRole || newRole === role) return;
    setRoleLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setRole(newRole as UserRole);
      toast.success("Role updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this account? This cannot be undone.")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("User deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={roleLoading || isSelf}>
        <SelectTrigger className="h-7 w-28 text-xs cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="cursor-pointer" value="personal">Personal</SelectItem>
          <SelectItem className="cursor-pointer" value="seeker">Job Seeker</SelectItem>
          <SelectItem className="cursor-pointer" value="employer">Company</SelectItem>
          <SelectItem className="cursor-pointer" value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="destructive"
        size="sm"
        className="h-7 text-xs px-2"
        onClick={handleDelete}
        disabled={deleteLoading || isSelf}
      >
        {deleteLoading ? "..." : "Delete"}
      </Button>
    </div>
  );
}
