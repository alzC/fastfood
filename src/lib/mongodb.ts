import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Veuillez définir `MONGODB_URI` dans le fichier `.env`.");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "production") {
  // En production, crée une nouvelle connexion
  client = new MongoClient(uri);
  clientPromise = client.connect();
} else {
  // En développement, utilise une connexion réutilisable
  const globalWithMongoClient = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongoClient._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongoClient._mongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongoClient._mongoClientPromise;
}

export default clientPromise;
