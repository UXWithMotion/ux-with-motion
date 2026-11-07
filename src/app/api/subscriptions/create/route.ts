import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan choice" }, { status: 400 });
    }

    const planId = plan === "monthly" 
      ? process.env.RAZORPAY_MONTHLY_PLAN_ID 
      : process.env.RAZORPAY_YEARLY_PLAN_ID;

    if (!planId) {
      return NextResponse.json({ error: "Plan configuration missing" }, { status: 500 });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json({ error: "Payments are temporarily unavailable" }, { status: 503 });
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSub) {
      return NextResponse.json({ error: "You already have an active subscription." }, { status: 400 });
    }

    // Create Razorpay Subscription
    // We use 100 cycles consistently for V1.
    // Razorpay rejects total_count > 100 for yearly plans.
    // 100 cycles means 100 months (~8.3 years) or 100 years depending on the plan.
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 100,
      customer_notify: 1,
    });

    // Save initial subscription state
    const { createServiceRoleClient } = await import("@/lib/supabase/service-role");
    const serviceRoleClient = createServiceRoleClient();

    await serviceRoleClient.from("user_subscriptions").insert({
      user_id: user.id,
      provider: "razorpay",
      provider_subscription_id: subscription.id,
      provider_plan_id: planId,
      plan_key: plan,
      status: subscription.status,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: unknown) {
    console.error("Subscription Creation Error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
