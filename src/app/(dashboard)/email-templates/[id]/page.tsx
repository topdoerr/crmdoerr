import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from "../actions";
import { TestEmailForm } from "./test-email-form";

export default async function EmailTemplateEditPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  const template = isNew
    ? null
    : await prisma.emailTemplate.findUnique({
        where: { id: parseInt(params.id, 10) },
      });

  if (!isNew && !template) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    if (isNew) {
      await createTemplate(formData);
    } else if (template) {
      await updateTemplate(template.id, formData);
    }
  }

  async function handleDelete() {
    "use server";
    if (template) {
      await deleteTemplate(template.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/email-templates">Back to Templates</Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {isNew ? "New Email Template" : template?.name}
        </h1>
        {!isNew && template && (
          <form action={handleDelete}>
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Use {"{{variable}}"} placeholders (e.g. {"{{firstName}}"}) that
              will be replaced at send time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={template?.name ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    required
                    defaultValue={template?.slug ?? ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  defaultValue={template?.subject ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">HTML Message *</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={14}
                  defaultValue={template?.message ?? ""}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    name="fromName"
                    defaultValue={template?.fromName ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    name="fromEmail"
                    type="email"
                    defaultValue={template?.fromEmail ?? ""}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="active"
                  name="active"
                  defaultChecked={template ? template.active === 1 : true}
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active
                </Label>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  {isNew ? "Create Template" : "Update Template"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {!isNew && template && (
          <Card>
            <CardHeader>
              <CardTitle>Send Test</CardTitle>
              <CardDescription>
                Send a test email to verify the template renders correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestEmailForm templateId={template.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
