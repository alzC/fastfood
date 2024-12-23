import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    const sig = req.headers['stripe-signature'] as string;
    const body = req.body;

    try {
        const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

        // Gestion des paiements réussis
        if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Connexion à la base de données
            const client = await clientPromise;
            const db = client.db('restaurant');
            
            // Mise à jour de la commande avec statut 'prepared'
            const order = await db.collection('orders').findOne({ sessionId: session.id });
            if (order) {
                await db.collection('orders').updateOne(
                    { sessionId: session.id },
                    { $set: { status: 'prepared', updatedAt: new Date() } }
                );
            }
        }

        // Gestion des paiements échoués
        if (event.type === 'checkout.session.async_payment_failed' || event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Connexion à la base de données
            const client = await clientPromise;
            const db = client.db('restaurant');

            // Mise à jour de la commande avec statut 'failed'
            const order = await db.collection('orders').findOne({ sessionId: session.id });
            if (order) {
                await db.collection('orders').updateOne(
                    { sessionId: session.id },
                    { $set: { status: 'failed', updatedAt: new Date() } }
                );
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Erreur de webhook Stripe:', error);
        const errorMessage = (error as Error).message;
        res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
}
