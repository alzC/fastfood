import { ObjectId } from 'mongodb';

export interface Product {
    _id?: ObjectId;
    name: string;
    price: number;
    stock: number;
    description: string;
    category: string;
    subCategory?: string;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
    ingredients?: string[]; // Liste des ingrédients disponibles
    supplements?: { name: string; price: number }[]; // Liste des suppléments avec prix
}
