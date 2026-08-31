import { createFileRoute } from "@tanstack/react-router";
import { UserManagementComponent } from "@/components/user-management";
import { RolesManagementComponent } from "@/components/roles-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard-ui";
import { Users, Shield } from "lucide-react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/super-admin/users")({
  component: UsersAndRolesPage,
});

function UsersAndRolesPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("users.page.title")}
        subtitle={t("users.page.subtitle")}
      />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-sm grid-cols-2 h-11">
          <TabsTrigger value="users" className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" />
            {t("users.page.title")}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4" />
            {t("nav.roles")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="m-0 border-none p-0 outline-none">
          <UserManagementComponent />
        </TabsContent>

        <TabsContent value="roles" className="m-0 border-none p-0 outline-none">
          <RolesManagementComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
