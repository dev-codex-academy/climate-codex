import React from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const NoAccess = () => {
    const { user } = useAuth();
    return (
        <div className="h-full flex items-center justify-center p-6" style={{ backgroundColor: "var(--c-surface)" }}>
            <div className="max-w-md text-center space-y-4" style={{ fontFamily: 'var(--font-body)' }}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}>
                    <Lock className="h-6 w-6" style={{ color: "var(--c-brand)" }} />
                </div>
                <p className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-heading)', color: "var(--c-ink)" }}>
                    Your account has no access yet
                </p>
                <p className="text-sm" style={{ color: "var(--c-muted)" }}>
                    {user?.username ? `${user.username}, you` : "You"} are signed in, but no role has been assigned to your account.
                    Ask an administrator to assign one and sign in again.
                </p>
            </div>
        </div>
    );
};
