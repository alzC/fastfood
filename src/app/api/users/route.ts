import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
    try {
        // Récupération des données de la requête
        const { email, password, role } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email et mot de passe sont requis" },
                { status: 400 }
            );
        }

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Connexion à la base de données
        const client = await clientPromise;
        const db = client.db("restaurant");

        // Vérification si l'utilisateur existe déjà
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            );
        }

        // Insertion de l'utilisateur
        const result = await db.collection("users").insertOne({
            email,
            password: hashedPassword,
            role: role || "user", // Par défaut, rôle utilisateur
            createdAt: new Date(),
        });

        return NextResponse.json({
            message: "Utilisateur créé avec succès",
            userId: result.insertedId,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'ajout de l'utilisateur" },
            { status: 500 }
        );
    }
}
