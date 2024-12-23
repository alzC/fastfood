import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('restaurant');

        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(params.id) },
            { $set: { status: 'prepared', updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Commande marquée comme préparée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande :', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commande' }, { status: 500 });
    }
}
