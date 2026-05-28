import { createCollection, listCollection } from "../_shared";

export async function GET(request: Request) {
  return listCollection("equations", request);
}

export async function POST(request: Request) {
  return createCollection("equations", request);
}
