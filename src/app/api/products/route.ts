import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Product } from '@/models/product';  // Importer le modèle Product
import { ObjectId } from 'mongodb';

// Récupérer tous les produits (GET)
export async function GET() {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const products = await db.collection('products').find().toArray();
  return NextResponse.json(products as unknown as Product[]);
}

// Ajouter un produit (POST)
export async function POST(request: NextRequest) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body: Product = await request.json();

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

