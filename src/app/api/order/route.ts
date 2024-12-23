import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // Assurez-vous que ce chemin est correct


export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        const orders = await db.collection('orders').find().toArray();

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des commandes' }, { status: 500 });
    }
}
