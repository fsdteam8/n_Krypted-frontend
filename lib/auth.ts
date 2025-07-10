import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password")
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const response = await res.json()

          if (!res.ok || !response?.success) {
            throw new Error(response?.message || "Login failed")
          }

          // Extract user data and token from the response structure
          const { data: user, token } = response

          // Return user object with the structure NextAuth expects
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
            role: user.role,
            accessToken: token, // Store the token as accessToken
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw new Error("Authentication failed. Please try again.")
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.phoneNumber = user.phoneNumber
        token.isVerified = user.isVerified
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        phoneNumber: token.phoneNumber,
        isVerified: token.isVerified,
        role: token.role,
        accessToken: token.accessToken,
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
}
