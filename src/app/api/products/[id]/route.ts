import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Récupérer un produit spécifique par ID (GET)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const product = await db.collection('products').findOne({ _id: new ObjectId(params.id) });

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// Mettre à jour un produit spécifique (PATCH)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body = await request.json();
  const { name, price, stock } = body;

  const updateFields: { [key: string]: any } = {};
  if (name) updateFields.name = name;
  if (price) updateFields.price = price;
  if (stock !== undefined) updateFields.stock = stock;

  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(params.id) },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(result);
}

// Remplacer complètement un produit (PUT)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body = await request.json();
  const { name, price, stock } = body;

  if (!name || !price || stock === undefined) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
  }

  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(params.id) },
    {
      $set: {
        name,
        price,
        stock,
      },
    }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Produit mis à jour avec succès' });
}

// Supprimer un produit (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db('restaurant');

  const result = await db.collection('products').deleteOne({ _id: new ObjectId(params.id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Produit supprimé avec succès' });
}
