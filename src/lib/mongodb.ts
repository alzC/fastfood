import { MongoClient} from 'mongodb';

const uri = process.env.MONGODB_URI as string; // Assurez-vous que MONGODB_URI est défini dans .env.local
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Veuillez définir MONGODB_URI dans .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // Utiliser une instance globale pour éviter des connexions multiples en mode développement
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Assurez-vous que clientPromise retourne un MongoClient correctement typé
export default clientPromise as Promise<MongoClient>;
