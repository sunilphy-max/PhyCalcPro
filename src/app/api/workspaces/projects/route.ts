import { createCollection, listCollection } from "../_shared";

export async function GET(request: Request) {
  return listCollection("projects", request);
}

export async function POST(request: Request) {
  return createCollection("projects", request);
}
