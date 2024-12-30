import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('restaurant');

        const orders = await db.collection('orders').find().toArray();

        const productSales: Record<string, number> = {};

        orders.forEach(order => {
            const items = JSON.parse(order.items);
            items.forEach((item: { name: string; quantity: number }) => {
                if (productSales[item.name]) {
                    productSales[item.name] += item.quantity;
                } else {
                    productSales[item.name] = item.quantity;
                }
            });
        });

        const topProducts = Object.entries(productSales)
            .map(([name, quantitySold]) => ({ name, quantitySold }))
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 10);

        return NextResponse.json(topProducts);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits les plus vendus :', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des produits les plus vendus' }, { status: 500 });
    }
}
