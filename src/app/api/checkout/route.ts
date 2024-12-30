import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/order';

const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
    console.log('Création de session Stripe');

    try {
        // Lecture des données reçues
        const { cart, address, phoneNumber, customerEmail } = await req.json();

        // Conversion des articles du panier pour Stripe
        const lineItems = cart.map((item: { name: string; price: number; quantity: number }) => ({
            price_data: {
                currency: 'eur',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        // Limiter la taille des valeurs des métadonnées
        const metadataAddress = JSON.stringify(address).slice(0, 500);
        const metadataCart = JSON.stringify(cart).slice(0, 500);

        // Création de la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.nextUrl.origin}/cancel`,
            metadata: {
                address: metadataAddress,
                cart: metadataCart,
                phoneNumber,
            },
            customer_email: customerEmail,
        });

        console.log('Session Stripe créée:', session.id);

        // Connexion à la base de données MongoDB
        const client = await clientPromise;
        const db = client.db('restaurant');

        // Création de l'objet Order
        const newOrder: Order = {
            sessionId: session.id,
            customerEmail,
            phoneNumber,
            address: JSON.stringify(address), // Assure une cohérence si l'adresse est un objet
            items: JSON.stringify(cart), // Conversion en chaîne si nécessaire
            status: 'pending',
            createdAt: new Date(),
        };

        // Insertion dans la collection "orders"
        await db.collection<Order>('orders').insertOne(newOrder);

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        console.error('Erreur Stripe :', error);
        return NextResponse.json({ error: 'Erreur lors de la création de session' }, { status: 500 });
    }
}
