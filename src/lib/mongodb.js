import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Assurez-vous que MONGODB_URI est défini dans .env.local
const options = {};

// Initialisez `clientPromise` directement pour éviter les erreurs de non-initialisation
let clientPromise;

if (!uri) {
  throw new Error('Veuillez définir MONGODB_URI dans .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // Utilisation d'une instance globale pour éviter des connexions multiples en mode développement
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Utilisation d'une instance normale pour la production
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Exportation de clientPromise sans typage
export default clientPromise;
