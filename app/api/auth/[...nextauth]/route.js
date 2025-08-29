import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions={
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user }) {
      // Trigger your API when login succeeds
      try {
        await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/auth/login`, {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
      } catch (err) {
        console.error("❌ Failed to call login API:", err);
      }
    }
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    })

  ]
}
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
