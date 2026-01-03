import starFilled from "../assets/icons/starFilled.svg";
import starUnFilled from "../assets/icons/starUnFilled.svg";

export function updateActiveSortButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

export function generateStarRating(rating) {
  // Generate filled stars based on rating and remaining as empty stars
  const filledStars = `<img src="${starFilled}" alt="★" />`.repeat(rating);
  const emptyStars = `<img src="${starUnFilled}" alt="☆" />`.repeat(5 - rating);
  return filledStars + emptyStars;
}

export function formatDate(dateString) {
  // Split the input string into day, month, and year
  const [day, month, year] = dateString.split("/");

  // Create a new Date object (months are 0-indexed in JavaScript)
  const date = new Date(`${year}-${month}-${day}`);

  // Options for formatting the date
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Format the date as "Month day, year" (e.g., "September 20, 2024")
  return date.toLocaleDateString("en-US", options);
}

export function truncateText(text, maxWords = 15) {
  const words = text.trim().split(/\s+/); // Split by whitespace
  if (words.length <= maxWords) return { text, isLong: false };

  return { text: words.slice(0, maxWords).join(" ") + "...", isLong: true };
}
