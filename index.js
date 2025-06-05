import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from "./resolvers/server.js";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config(); // ✅ Loads .env before anything else

// Wrapping everything in an async function
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // GraphQL Type Definitions
  const typeDefs = `
    type Query {
      getUsers: [User]
      getUserById(id: ID!): User
    }

    type Mutation {
  createUser(name: String!, age: Int!, isMarried: Boolean!): User
}

    type User {
      id: ID
      name: String
      age: Int
      isMarried: Boolean
    }
  `;

  // Resolvers
  const resolvers = {
    Query: {
      getUsers: async () => await User.find(),
      getUserById: async (_, { id }) => await User.findById(id),
    },
    Mutation: {
      createUser: async (_, { name, age, isMarried }) => {
        try {
          const newUser = new User({ name, age, isMarried });
          await newUser.save();
          console.log("User created:", newUser);
          return newUser;
        } catch (err) {
          console.error("Error creating user:", err);
          throw new Error("Failed to create user");
        }
      },
    },
  };

  // Start Apollo Server
  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 8080 },
  });

  console.log(`🚀 Server ready at ${url}`);
};

// Call the function to start everything
startServer();
