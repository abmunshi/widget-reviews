// dataService.js

export async function fetchReviews() {
  try {
    const response = await fetch("./reviews.json");
    if (!response.ok) throw new Error("Could not fetch reviews data");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}
