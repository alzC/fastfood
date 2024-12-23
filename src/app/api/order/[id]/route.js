import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET({ params }) {
    try {
        const client = await clientPromise;
        const db = client.db('restaurant');

        const order = await db.collection('orders').findOne({ sessionId: params.id });

        if (!order) {
            return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande :', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération de la commande' }, { status: 500 });
    }
}
