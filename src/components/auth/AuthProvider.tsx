import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { type StaffProfile, fetchCurrentStaffProfile } from "@/lib/cd-vms";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  loading: boolean;
  profile: StaffProfile | null;
  session: Session | null;
  user: User | null;
  refreshProfile: () => Promise<StaffProfile | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      return null;
    }

    try {
      const nextProfile = await fetchCurrentStaffProfile();
      setProfile(nextProfile);
      return nextProfile;
    } catch {
      setProfile(null);
      return null;
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const {
        data: { session: nextSession }
      } = await supabase.auth.getSession();

      if (!active) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await loadProfile(nextSession?.user ?? null);

      if (active) {
        setLoading(false);
      }
    }

    void bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(true);
      void loadProfile(nextSession?.user ?? null).finally(() => {
        setLoading(false);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        profile,
        session,
        user,
        refreshProfile: async () => {
          const {
            data: { user: nextUser }
          } = await supabase.auth.getUser();
          setUser(nextUser);
          return await loadProfile(nextUser);
        },
        signOut: async () => {
          await supabase.auth.signOut();
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
