import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";
import { getMyFamilyGroups } from "@/lib/actions/family";
import { FamilyGroupCard } from "./family-group-card";
import { NewGroupButton } from "./new-group-button";

export default async function FamiliaPage() {
  const [user, groups] = await Promise.all([getCurrentUser(), getMyFamilyGroups()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Grupos Familiares</h1>
          <p className="text-sm text-muted-foreground">Comparte presupuestos con tu familia</p>
        </div>
        <NewGroupButton />
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No perteneces a ningún grupo familiar.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea un grupo para compartir presupuestos con tu familia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <FamilyGroupCard key={group.id} group={group} currentUserId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
