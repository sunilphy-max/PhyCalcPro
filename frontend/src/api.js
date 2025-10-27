const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getBoltStress(diameter, load) {
  const url = `${API_BASE_URL}/bolt?diameter=${diameter}&load=${load}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch bolt data");
  }
  return response.json();
}
