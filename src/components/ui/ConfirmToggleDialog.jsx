// components/ConfirmToggleDialog.jsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmToggleDialog({
  open,
  onOpenChange,
  roleName = "",
  isActive = false,
  onConfirm,
  loading = false,
}) {
  const actionLabel = isActive ? "Desactivar" : "Activar";
  const actionClass = isActive
    ? "bg-red-600 text-white hover:bg-red-700"
    : "bg-primary text-primary-foreground hover:opacity-90";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] text-[#000]">
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Confirmar Desactivación" : "Confirmar Activación"}
          </DialogTitle>
          <DialogDescription>
            ¿Deseas {actionLabel.toLowerCase()} el rol{" "}
            <span className="font-medium">{roleName}</span>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-md">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md ml-1.5 ${actionClass}`}
          >
            {loading ? "Procesando..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
