import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string; // Assurez-vous que MONGODB_URI est défini dans .env.local
const options = {};

// Initialisez `clientPromise` directement pour éviter les erreurs de non-initialisation
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Veuillez définir MONGODB_URI dans .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // Utilisation d'une instance globale pour éviter des connexions multiples en mode développement
  if (!(global as any)._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // Utilisation d'une instance normale pour la production
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Assurez-vous que clientPromise retourne un MongoClient correctement typé
export default clientPromise;
