import { createCollection, deleteModel, listCollection } from "../_shared";

export async function GET(request: Request) {
  return listCollection("models", request);
}

export async function POST(request: Request) {
  return createCollection("models", request);
}

export async function DELETE(request: Request) {
  return deleteModel(request);
}
