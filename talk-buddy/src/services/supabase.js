import { createClient } from "@supabase/supabase-js";
export const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
export const supabase = configured
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    )
  : null;
let signingIn;
export async function getUser() {
  if (!supabase)
    throw new Error(
      "Connect Supabase to start AI practice. See the setup guide in the README.",
    );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session.user;
  if (!signingIn)
    signingIn = supabase.auth.signInAnonymously().finally(() => {
      signingIn = null;
    });
  const { data, error } = await signingIn;
  if (error)
    throw new Error(
      `Could not connect: ${error.message}. Check that anonymous sign-in is enabled in Supabase.`,
    );
  return data.user;
}
export async function invoke(name, body) {
  await getUser();
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try {
      message = (await error.context.json()).error || message;
    } catch {
      /* A network failure may not include a response. */
    }
    throw new Error(message);
  }
  return data;
}
export async function recentSessions() {
  const user = await getUser();
  const { data, error } = await supabase
    .from("sessions")
    .select("*, reflections(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
export async function deleteHistory() {
  const user = await getUser();
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("user_id", user.id);
  if (error) throw error;
}
