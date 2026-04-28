"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface StaffNode {
  staffId: number;
  name: string;
  jobTitle: string;
  children: StaffNode[];
}

interface StaffData {
  staffid: number;
  firstName: string;
  lastName: string;
}

interface ProfileData {
  staffId: number;
  jobTitle: string | null;
  reportsTo: number | null;
}

function buildTree(staff: StaffData[], profiles: ProfileData[]): StaffNode[] {
  const profileMap = new Map(profiles.map((p) => [p.staffId, p]));
  const nodeMap = new Map<number, StaffNode>();

  // Create nodes for all staff
  staff.forEach((s) => {
    const profile = profileMap.get(s.staffid);
    nodeMap.set(s.staffid, {
      staffId: s.staffid,
      name: `${s.firstName} ${s.lastName}`,
      jobTitle: profile?.jobTitle || "",
      children: [],
    });
  });

  const roots: StaffNode[] = [];

  // Build tree based on reportsTo
  staff.forEach((s) => {
    const profile = profileMap.get(s.staffid);
    const node = nodeMap.get(s.staffid)!;
    if (profile?.reportsTo && nodeMap.has(profile.reportsTo)) {
      nodeMap.get(profile.reportsTo)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function OrgNode({ node, isLast }: { node: StaffNode; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center px-2 py-1.5 border rounded-lg bg-background shadow-sm min-w-[140px]">
        <Avatar className="h-8 w-8 mb-1">
          <AvatarFallback className="text-xs">
            {getInitials(node.name)}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs font-medium text-center">{node.name}</p>
        {node.jobTitle && (
          <p className="text-[10px] text-muted-foreground text-center">
            {node.jobTitle}
          </p>
        )}
      </div>

      {node.children.length > 0 && (
        <>
          {/* Vertical line down from node */}
          <div className="w-px h-5 bg-border" />

          {/* Horizontal line across children */}
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-px bg-border absolute top-0"
                style={{
                  left: `${100 / (2 * node.children.length)}%`,
                  right: `${100 / (2 * node.children.length)}%`,
                }}
              />
            </div>
          )}

          <div className="flex gap-4">
            {node.children.map((child, i) => (
              <div key={child.staffId} className="flex flex-col items-center">
                {/* Vertical line down to child */}
                <div className="w-px h-5 bg-border" />
                <OrgNode
                  node={child}
                  isLast={i === node.children.length - 1}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart() {
  const [tree, setTree] = useState<StaffNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [staffRes, profilesRes] = await Promise.all([
          fetch("/api/staff-list"),
          fetch("/api/staff-profiles"),
        ]);
        const staff = await staffRes.json();
        const profiles = await profilesRes.json();
        setTree(buildTree(staff, profiles));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Loading org chart...
      </p>
    );
  }

  if (tree.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No staff profiles found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto py-6">
      <div className="flex gap-8 justify-center min-w-max">
        {tree.map((root) => (
          <OrgNode key={root.staffId} node={root} isLast={false} />
        ))}
      </div>
    </div>
  );
}
