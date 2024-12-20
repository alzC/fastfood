import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';


export const dynamic = 'force-dynamic';

// Récupérer tous les produits (GET)
export async function GET() {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const products = await db.collection('products').find().toArray();
  return NextResponse.json(products); // Pas besoin de typage ici en JS
}

// Ajouter un produit (POST)
export async function POST(request) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body = await request.json();

  if (!body.name || !body.price || body.stock === undefined || !body.category || !body.description) {
    return NextResponse.json({ error: 'Nom, prix, stock, catégorie et description sont requis.' }, { status: 400 });
  }

  try {
    const result = await db.collection('products').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newProduct = await db.collection('products').findOne({ _id: result.insertedId });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout du produit.' }, { status: 500 });
  }
}

