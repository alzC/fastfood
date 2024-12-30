import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('restaurant');

        const orders = await db.collection('orders').find().toArray();

        const monthlyRevenue: Record<string, number> = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const total = JSON.parse(order.items).reduce((sum: number, item: { price: number, quantity: number }) => sum + item.price * item.quantity, 0);

            if (monthlyRevenue[month]) {
                monthlyRevenue[month] += total;
            } else {
                monthlyRevenue[month] = total;
            }
        });

        const revenueData = Object.entries(monthlyRevenue)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        return NextResponse.json(revenueData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de revenu mensuel :', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des données de revenu mensuel' }, { status: 500 });
    }
}
