import importedClientPromise from "@/lib/mongodb"; // Renommé pour éviter le conflit
import  { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { Db, MongoClient } from "mongodb";

// Étendre les types pour inclure `role` dans User
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    role?: string;
  }
}

// Typage explicite pour le client MongoDB
const clientPromise: Promise<MongoClient> = (async () => {
  const client = await importedClientPromise; // Utilisation de l'import renommé
  return client;
})();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "votre-email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const client = await clientPromise;
        const db: Db = client.db("restaurant");

        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Email incorrect");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
      };
      return session;
    },
  },
};