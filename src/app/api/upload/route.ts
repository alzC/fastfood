import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

// Définir les types pour la requête et la réponse
export const POST = async (req: Request): Promise<Response> => {
  try {
    // Récupérer les données du formulaire
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extraire l'extension du fichier
    const originalName = file.name || "unknown";
    const fileExtension = path.extname(originalName).toLowerCase();

    // Vérifier si l'extension est valide
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: "Extension de fichier non valide." }, { status: 400 });
    }

    // Renommer l'image avec un format standardisé
    const timestamp = Date.now();
    const filename = `image-${timestamp}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Chemin complet du fichier
    const filePath = path.join(uploadDir, filename);

    // Écrire le fichier dans le dossier public/uploads
    await writeFile(filePath, buffer);

    // Retourner le chemin public de l'image
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ message: "Succès", url: fileUrl, status: 201 });
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    return NextResponse.json({ error: "Erreur lors de l'upload du fichier." }, { status: 500 });
  }
};
