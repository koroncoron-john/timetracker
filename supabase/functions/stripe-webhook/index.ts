import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Received event:', event.type);

    // 決済完了 → premiumに昇格
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        console.log('checkout.session.completed for userId:', userId);

        if (userId) {
            const { error } = await supabaseClient
                .from('user_profiles')
                .update({
                    subscription_plan: 'premium',
                    subscription_status: 'active',
                })
                .eq('id', userId);

            if (error) {
                console.error('Failed to update subscription:', error);
                return new Response(JSON.stringify({ error: error.message }), { status: 500 });
            }
            console.log('Successfully updated to premium for userId:', userId);
        }
    }

    // サブスク解約 → freeに降格
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            const email = customer.email;
            if (email) {
                await supabaseClient
                    .from('user_profiles')
                    .update({
                        subscription_plan: 'free',
                        subscription_status: 'canceled',
                    })
                    .eq('email', email);
                console.log('Successfully downgraded to free for email:', email);
            }
        } catch (err) {
            console.error('Failed to handle subscription deletion:', err);
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
});
