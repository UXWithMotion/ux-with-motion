import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedComponents } from "@/lib/admin/components/queries";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "Profile",
  description: "User profile on uxwithmotion (UX With Motion).",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isPremium = !!subscription;

  let components: any[] = [];
  try {
    components = (await getPublishedComponents()) || [];
  } catch (err) {
    console.error("Failed to load components for profile:", err);
  }

  return (
    <ProfileClient 
      user={user} 
      isPremium={isPremium} 
      subscription={subscription} 
      initialComponents={components} 
    />
  );
}

