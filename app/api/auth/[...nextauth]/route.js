import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDB } from "@utils/database";

console.log({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  async session({ session }) {
    const userSession = await User.findOnr({
      email: session.email,
    });
    session.user.id = userSession._id.toString();
    return session;
  },
  async signIn({ profile }) {
    try {
      await connectToDB();
      //check if the user already exit
      const userExist = await User.findOnr({
        email: profile.email,
      });

      // if not ,create a new user
      if (!userExist) {
        await User.create({
          email: profile.email,
          username: profile.name.replace(" ", "").toLowerCase(),
          Image: profile.picture,
        });
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export { handler as GET, handler as POST };
