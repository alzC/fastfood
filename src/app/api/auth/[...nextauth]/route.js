import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "votre-email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db('restaurant');

        // Recherche de l'utilisateur dans la base de données
        const user = await db.collection('users').findOne({ email: credentials?.email });
        console.log(user);

        if (!user) {
          throw new Error("Email incorrect");
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(credentials?.password, user.password);

        if (!isValidPassword) {
          throw new Error("mot de passe incorrect");
        }

        return { id: user._id, email: user.email, role: user.role };
      },
    })
  ],
  session: {
    strategy: 'jwt', // Indique que la session utilise un JWT
  },
  callbacks: {
    // Callback jwt : Ajoute des données au token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    // Callback session : Ajoute des données à la session
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
