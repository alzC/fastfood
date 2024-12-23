import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'; // Assurez-vous que ce chemin est correct

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, customerEmail, phoneNumber, address, items } = body;

        const client = await clientPromise;
        const db = client.db();

        // Insertion de la commande dans MongoDB
        const result = await db.collection('orders').insertOne({
            sessionId,
            customerEmail,
            phoneNumber,
            address,
            items,
            status: 'pending',
            createdAt: new Date(),
        });

        return NextResponse.json({ message: 'Commande enregistrée avec succès', id: result.insertedId });
    } catch (error) {
        console.error('Erreur lors de l’enregistrement de la commande :', error);
        return NextResponse.json({ error: 'Erreur lors de l’enregistrement de la commande' }, { status: 500 });
    }
}

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
