// models/Order.ts
import { ObjectId } from "mongodb";

export interface Order {
    _id?: ObjectId; // Ajouté automatiquement par MongoDB
    sessionId: string; // ID de session Stripe
    customerEmail: string; // Email du client
    phoneNumber: string; // Numéro de téléphone
    address: string;
    items: string;
    status: "pending" | "paid" | "failed" | "prepared"; // État de la commande
    createdAt: Date; // Date de création de la commande
    updatedAt?: Date; // Date de dernière mise à jour
}
