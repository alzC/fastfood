import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

// Récupérer un produit spécifique par ID (GET)
export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Résolvez les paramètres avant de les utiliser
  const client = await clientPromise;
  const db = client.db('restaurant');

  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json(product);
}

// Mettre à jour un produit spécifique (PATCH)
export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Résolvez les paramètres avant de les utiliser
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body = await request.json();
  const { name, price, stock } = body;

  const updateFields: Record<string, unknown> = {};

  if (name) updateFields.name = name;
  if (price) updateFields.price = price;
  if (stock !== undefined) updateFields.stock = stock;
if (body.ingredients) updateFields.ingredients = body.ingredients;
if (body.supplements) updateFields.supplements = body.supplements;
  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Produit mis à jour avec succès' });
}

// Remplacer complètement un produit (PUT)
export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Résolvez les paramètres avant de les utiliser
  const client = await clientPromise;
  const db = client.db('restaurant');

  const body = await request.json();
  const { name, price, stock, ingredients, supplements, imageUrl } = body; // Récupérer imageUrl depuis le body

  if (!name || !price || stock === undefined) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
  }

  // Préparez les champs à mettre à jour
  const updateFields: { name: string; price: number; stock: number; ingredients?: string[]; supplements?: string[]; imageUrl?: string } = {
    name,
    price,
    stock,
  };

  // Ajoutez les champs optionnels uniquement s'ils sont présents
  if (ingredients) updateFields.ingredients = ingredients;
  if (supplements) updateFields.supplements = supplements;

  // Si une nouvelle image est envoyée, on met à jour l'URL
  if (imageUrl) {
    updateFields.imageUrl = imageUrl;
  }

  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  console.log('Produit mis à jour avec succès:', { id, updateFields });
  return NextResponse.json({ message: 'Produit mis à jour avec succès' });
}

// Supprimer un produit (DELETE)
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Résolvez les paramètres avant de les utiliser
  const client = await clientPromise;
  const db = client.db('restaurant');

  const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  if (product.imageUrl) {
    const imagePath = path.join(process.cwd(), 'public', 'uploads', path.basename(product.imageUrl));
    try {
      await fs.unlink(imagePath);
      console.log(`Image supprimée : ${imagePath}`);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'image:', err);
    }
  }

  const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Échec de la suppression du produit' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Produit supprimé avec succès' });
}
