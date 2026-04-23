import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createGroup, updateGroup, deleteGroup } from "../actions";

export default async function KnowledgeBaseGroupsPage() {
  const groups = await prisma.knowledgeBaseGroup.findMany({
    orderBy: [{ groupOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { articles: true } } },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createGroup({
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      color: String(formData.get("color") || "#2a88d5"),
      groupOrder: parseInt(String(formData.get("groupOrder") || "0"), 10),
      active: formData.get("active") === "on",
    });
  }

  async function handleUpdate(id: number, formData: FormData) {
    "use server";
    await updateGroup(id, {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      color: String(formData.get("color") || "#2a88d5"),
      groupOrder: parseInt(String(formData.get("groupOrder") || "0"), 10),
      active: formData.get("active") === "on",
    });
  }

  async function handleDelete(id: number) {
    "use server";
    await deleteGroup(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/knowledge-base"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Knowledge Base
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            Manage Groups
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={handleCreate} className="grid gap-3 md:grid-cols-6 md:items-end">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue="#2a88d5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groupOrder">Order</Label>
              <Input
                id="groupOrder"
                name="groupOrder"
                type="number"
                defaultValue={0}
              />
            </div>
            <div className="md:col-span-6 flex items-center justify-between">
              <label className="flex items-center gap-2">
                <Checkbox name="active" defaultChecked />
                <span className="text-sm">Active</span>
              </label>
              <Button type="submit">Create Group</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No groups yet.
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((g) => {
                  const update = handleUpdate.bind(null, g.id);
                  const del = handleDelete.bind(null, g.id);
                  return (
                    <TableRow key={g.id}>
                      <TableCell>
                        <form
                          id={`edit-${g.id}`}
                          action={update}
                          className="flex flex-col gap-2"
                        >
                          <Input
                            name="name"
                            defaultValue={g.name}
                            required
                          />
                          <Input
                            name="description"
                            defaultValue={g.description ?? ""}
                            placeholder="Description"
                          />
                        </form>
                      </TableCell>
                      <TableCell>
                        <Input
                          form={`edit-${g.id}`}
                          name="color"
                          type="color"
                          defaultValue={g.color ?? "#2a88d5"}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          form={`edit-${g.id}`}
                          name="groupOrder"
                          type="number"
                          defaultValue={g.groupOrder}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {g._count.articles}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            form={`edit-${g.id}`}
                            name="active"
                            defaultChecked={g.active === 1}
                          />
                        </label>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          form={`edit-${g.id}`}
                          type="submit"
                          size="sm"
                        >
                          Save
                        </Button>
                        <form action={del} className="inline">
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
