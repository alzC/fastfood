// lib/models/user.ts
import { ObjectId } from 'mongodb';

export interface User {
    _id: ObjectId;  // Utilisation de ObjectId de MongoDB
    email: string;
    password: string;
    role: 'admin' | 'livreur'; // Tu peux ajuster les rôles selon ton besoin
}
