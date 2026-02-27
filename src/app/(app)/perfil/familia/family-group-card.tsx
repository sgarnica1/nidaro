"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Trash2, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { inviteMemberByEmail, removeMember, leaveFamilyGroup, deleteFamilyGroup, type FamilyGroupWithMembers } from "@/lib/actions/family";

type Props = {
  group: FamilyGroupWithMembers;
  currentUserId: string;
};

const inviteSchema = z.object({ email: z.string().email("Correo inválido") });

export function FamilyGroupCard({ group, currentUserId }: Props) {
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isOwner = group.ownerId === currentUserId;

  const form = useForm({ resolver: zodResolver(inviteSchema), defaultValues: { email: "" } });

  async function onInvite({ email }: { email: string }) {
    const result = await inviteMemberByEmail(group.id, email);
    if (result.success) {
      setInviteOpen(false);
      form.reset();
    } else {
    }
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(group.id, memberId);
    });
  }

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveFamilyGroup(group.id);
    });
  }

  function handleDelete() {
    setDeleteOpen(false);
    startTransition(async () => {
      const result = await deleteFamilyGroup(group.id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{group.name}</CardTitle>
          <div className="flex items-center gap-1">
            {isOwner && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invitar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invitar miembro</DialogTitle>
                    <DialogDescription>
                      El usuario debe estar registrado en la aplicación.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? "Invitando..." : "Invitar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
            {isOwner ? (
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar grupo</DialogTitle>
                    <DialogDescription>
                      ¿Eliminar el grupo &quot;{group.name}&quot;? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" disabled={pending} onClick={handleDelete}>Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleLeave} disabled={pending}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-3" />
        <div className="space-y-2">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "OWNER" ? "default" : "secondary"} className="text-xs">
                  {member.role === "OWNER" ? "Propietario" : "Editor"}
                </Badge>
                {isOwner && member.role !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={pending}
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
