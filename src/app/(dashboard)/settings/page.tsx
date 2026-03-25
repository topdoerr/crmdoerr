import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revalidatePath } from "next/cache";

async function updateProfile(formData: FormData) {
  "use server";

  const staffId = Number(formData.get("staffId"));
  if (!staffId) return;

  await prisma.staff.update({
    where: { staffid: staffId },
    data: {
      firstName: (formData.get("firstName") as string) || undefined,
      lastName: (formData.get("lastName") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      phonenumber: (formData.get("phonenumber") as string) || undefined,
    },
  });

  revalidatePath("/settings");
}

export default async function SettingsPage() {
  // Fetch the first staff member as the current user for now
  const staff = await prisma.staff.findFirst({
    where: { active: 1 },
    orderBy: { staffid: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {staff ? (
                <form action={updateProfile} className="space-y-4 max-w-lg">
                  <input type="hidden" name="staffId" value={staff.staffid} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={staff.firstName ?? ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={staff.lastName ?? ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={staff.email ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonenumber">Phone</Label>
                    <Input
                      id="phonenumber"
                      name="phonenumber"
                      defaultValue={staff.phonenumber ?? ""}
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No staff profile found. Please contact an administrator.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Company settings configuration will be available here. You can
                manage your company name, address, logo, and other business
                details.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure email templates, SMTP settings, and notification
                preferences here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure date formats, timezone, currency, and language
                preferences here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
