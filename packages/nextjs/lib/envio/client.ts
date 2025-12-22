import { GraphQLClient } from "graphql-request";

/**
 * Envio GraphQL endpoint URL
 * This connects to the local Envio indexer
 */
const ENVIO_GRAPHQL_URL = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || "http://localhost:8080/v1/graphql";

/**
 * GraphQL client instance for querying the Envio indexer
 */
export const envioClient = new GraphQLClient(ENVIO_GRAPHQL_URL, {
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get the current Envio endpoint URL
 */
export const getEnvioEndpoint = () => ENVIO_GRAPHQL_URL;
