import Link from "next/link";
import { Users, Settings, CircleUserRound, Tags, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="grid gap-3">
        <Link href="/categorias">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tags className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Categorías de gastos</p>
                    <p className="text-xs text-muted-foreground">Crea y organiza tus categorías de gasto</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/perfil/familia">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Grupos familiares</p>
                    <p className="text-xs text-muted-foreground">Comparte presupuestos con tu familia</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/estructura">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Estructura del presupuesto</p>
                    <p className="text-xs text-muted-foreground">Configura los porcentajes 50/30/20</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/perfil/conta">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CircleUserRound className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Cuenta</p>
                    <p className="text-xs text-muted-foreground">Gestiona tu información personal y seguridad</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
