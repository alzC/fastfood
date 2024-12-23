import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

// Récupérer un produit spécifique par ID (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection('products').findOne({ _id: new ObjectId(params.id) });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du produit' }, { status: 500 });
  }
}

// Mettre à jour un produit spécifique (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('restaurant');

    const body = await req.json();
    const { name, price, stock, category, subCategory, description, imageUrl, ingredients, supplements } = body;

    const updateFields: Record<string, unknown> = {};

    if (name) updateFields.name = name;
    if (price) updateFields.price = price;
    if (stock !== undefined) updateFields.stock = stock;
    if (category) updateFields.category = category;
    if (subCategory) updateFields.subCategory = subCategory;
    if (description) updateFields.description = description;
    if (imageUrl) updateFields.imageUrl = imageUrl;
    if (ingredients) updateFields.ingredients = ingredients;
    if (supplements) updateFields.supplements = supplements;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

// Remplacer complètement un produit (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('restaurant');

    const body = await req.json();
    const { name, price, stock, category, subCategory, description, ingredients, supplements, imageUrl } = body;

    if (!name || !price || stock === undefined) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      name,
      price,
      stock,
      category,
      subCategory,
      description,
    };

    if (ingredients) updateFields.ingredients = ingredients;
    if (supplements) updateFields.supplements = supplements;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    console.log('Produit mis à jour avec succès:', { id: params.id, updateFields });
    return NextResponse.json({ message: 'Produit mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du produit' }, { status: 500 });
  }
}

// Supprimer un produit (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('restaurant');

    const product = await db.collection('products').findOne({ _id: new ObjectId(params.id) });

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    if (product.imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', 'uploads', path.basename(product.imageUrl));
      try {
        await fs.unlink(imagePath);
        console.log(`Image supprimée : ${imagePath}`);
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'image :', err);
      }
    }

    const result = await db.collection('products').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Échec de la suppression du produit' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
