import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { buildServer } from "../server";

export type TestClient = {
	client: Client;
	close: () => Promise<void>;
};

export async function createTestClient(): Promise<TestClient> {
	const server = buildServer();
	const client = new Client({ name: "test-client", version: "0.1.0" });
	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
	return {
		client,
		close: async () => {
			await client.close();
			await server.close();
		},
	};
}
