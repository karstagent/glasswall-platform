import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import TwitterProvider from 'next-auth/providers/twitter';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

// Mock user database
const users = [
  {
    id: 'user_1',
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'user',
  },
  {
    id: 'user_2',
    name: 'Admin User',
    email: 'admin@glasswall.app',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
  },
  {
    id: 'agent_1',
    name: 'CryptoAnalyst',
    email: 'crypto@agent.glasswall.app',
    password: 'agent123', // In a real app, this would be hashed
    role: 'agent',
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Find the user by email
        const user = users.find(user => user.email === credentials.email);
        
        // Check if user exists and password matches
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        
        return null;
      },
    }),
    // Add Twitter provider for agent verification
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || 'twitter-client-id-placeholder',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || 'twitter-client-secret-placeholder',
      version: '2.0',
    }),
    // Add Google provider for user accounts
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id-placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-placeholder',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token if user is set (on sign in)
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'this-is-a-secret-for-development-only',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };