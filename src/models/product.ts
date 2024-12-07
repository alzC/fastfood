import { ObjectId } from 'mongodb';

export interface Product {
    _id?: ObjectId;  // L'ID est généré automatiquement par MongoDB si non fourni
    name: string;    // Nom du produit
    price: number;   // Prix du produit
    stock: number;   // Quantité disponible en stock
    description: string;  // Optionnel, description du produit
    category: string;      // Catégorie principale du produit (ex: "Pizza")
    subCategory?: string;  // Sous-catégorie du produit (ex: "Pizza Végétarienne")
    imageUrl: string;     // Optionnel, URL de l'image du produit
    createdAt?: Date;      // Date de création du produit
    updatedAt?: Date;      // Date de mise à jour du produit
}
