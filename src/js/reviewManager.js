// reviewManager.js

import TomSelect from "tom-select";
import { fetchReviews } from "./dataService.js";
import { openPhotoGallery } from "./photoGallery.js";
import {
  updateActiveSortButton,
  generateStarRating,
  formatDate,
  truncateText,
} from "./utils.js";

import starFilled from "../assets/icons/starFilled.svg";
import caretDownIcon from "../assets/icons/caretDown.svg";

export class ReviewManager {
  constructor(
    containerId,
    controlsId,
    itemsPerPage = 10,
    enablePagination = false,
    compactLayout = false
  ) {
    this.container = document.getElementById(containerId);
    this.controls = document.getElementById(controlsId);
    this.enablePagination = enablePagination;
    this.compactLayout = compactLayout;
    this.paginationContainer = enablePagination
      ? document.createElement("div")
      : null;
    if (this.paginationContainer) {
      this.paginationContainer.classList.add("pagination");
      this.container.after(this.paginationContainer);
    }
    this.reviews = [];
    this.filteredReviews = [];
    this.currentSortOrder = "desc";
    this.currentRatingFilter = "all";
    this.currentPage = 1;
    this.itemsPerPage = itemsPerPage;
  }

  async init() {
    this.showLoader();
    try {
      this.reviews = await fetchReviews();
      this.filteredReviews = [...this.reviews];
      this.setupControls();
      this.applySortAndFilter();
    } catch (error) {
      console.error("Error in init():", error);
      this.showError("Failed to load reviews.");
      throw error; // Keep error for debugging
    } finally {
      this.hideLoader();
    }
  }

  showLoader() {
    if (this.container) {
      this.container.innerHTML = `<div class="loader">Loading...</div>`;
    }
  }

  hideLoader() {
    if (this.container) {
      // Only clear the loader, not the reviews
      const loader = this.container.querySelector(".loader");
      if (loader) {
        loader.remove();
      }
    }
  }

  showError(message) {
    if (this.container) {
      this.container.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  setupControls() {
    if (this.container.id === "rv-widget-container") {
      // Off-canvas widget area: Use buttons for sorting
      const sortNewestButton = this.controls.querySelector("#sort-newest");
      const sortOldestButton = this.controls.querySelector("#sort-oldest");
      const ratingFilterSelect = this.controls.querySelector("select");

      sortNewestButton.addEventListener("click", () => {
        this.currentSortOrder = "desc"; // Newest first
        this.applySortAndFilter();
        updateActiveSortButton(sortNewestButton, sortOldestButton);
      });

      sortOldestButton.addEventListener("click", () => {
        this.currentSortOrder = "asc"; // Oldest first
        this.applySortAndFilter();
        updateActiveSortButton(sortOldestButton, sortNewestButton);
      });
      new TomSelect(ratingFilterSelect, {
        create: false,
        sortField: { field: "text", direction: "desc" },
        maxOptions: 6,
      });

      // Filtering with select dropdown
      ratingFilterSelect.addEventListener("change", (event) => {
        this.currentRatingFilter = event.target.value;
        this.applySortAndFilter();
      });
    } else {
      // Select elements for sorting and filtering
      const dateSortSelect = this.controls.querySelector(
        "select:nth-of-type(1)"
      );
      const ratingFilterSelect = this.controls.querySelector(
        "select:nth-of-type(2)"
      );

      // Set dropdowns to default values
      dateSortSelect.value = this.currentSortOrder;
      ratingFilterSelect.value = this.currentRatingFilter;

      // Initialize Tom Select on both dropdowns
      new TomSelect(dateSortSelect, {
        create: false,
        sortField: { field: "text", direction: "desc" },
        maxOptions: 6,
      });

      new TomSelect(ratingFilterSelect, {
        create: false,
        sortField: { field: "text", direction: "desc" },
        maxOptions: 6,
      });

      // Sorting by Date
      dateSortSelect.addEventListener("change", (event) => {
        this.currentSortOrder = event.target.value;
        this.applySortAndFilter();
      });

      // Filtering by Rating
      ratingFilterSelect.addEventListener("change", (event) => {
        this.currentRatingFilter = event.target.value;
        this.applySortAndFilter();
      });

      // Set the default selected value to "desc" on load
      dateSortSelect.value = "desc";

      if (this.enablePagination) {
        this.updatePagination(); // Only for review-area
      }
    }
  }

  applySortAndFilter() {
    // go to the first page
    this.currentPage = 1;
    // Apply filtering first
    this.filterReviews(this.currentRatingFilter);
    // Then apply sorting on the filtered results
    this.sortReviews(this.currentSortOrder, "date");

    // Render the results
    this.renderReviews();
    if (this.enablePagination) {
      this.updatePagination();
    }
  }

  filterReviews(rating) {
    if (rating === "all") {
      this.filteredReviews = [...this.reviews];
    } else {
      const ratingValue = parseInt(rating);
      this.filteredReviews = this.reviews.filter(
        (review) => review.rating === ratingValue
      );
    }
  }

  sortReviews(order, criteria) {
    const parseDate = (dateString) => {
      const [day, month, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day); // JavaScript Date months are 0-indexed
    };
    this.filteredReviews.sort((a, b) => {
      if (criteria === "date") {
        const dateA = parseDate(a.purchaseDate);
        const dateB = parseDate(b.purchaseDate);
        return order === "desc" ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });
  }
  renderReviews() {
    this.container.innerHTML = "";
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.enablePagination
      ? startIndex + this.itemsPerPage
      : this.filteredReviews.length;

    const reviewsToDisplay = this.filteredReviews.slice(startIndex, endIndex);
    reviewsToDisplay.forEach((review) => {
      const reviewElement = this.createReviewElement(review);
      this.container.appendChild(reviewElement);
    });
    // display total reviews in tab button
    if (document.querySelectorAll("[data-rvTotal]") !== null) {
      let rvTotalDisplayCount = document.querySelectorAll("[data-rvTotal]");
      rvTotalDisplayCount.forEach(
        (each) => (each.innerHTML = `${this.reviews.length}`)
      );
    }
  }

  updatePagination() {
    if (!this.enablePagination) return;

    this.paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(
      this.filteredReviews.length / this.itemsPerPage
    );
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.innerText = i;
      pageButton.classList.add("page-button");
      if (i === this.currentPage) pageButton.classList.add("active");

      pageButton.addEventListener("click", () => {
        this.currentPage = i;
        this.renderReviews();
        this.updatePagination();
        // Scroll to the review-container (parent) so filters/sort are also visible
        const containerToScroll = this.container.parentElement; // Assuming review-area is inside review-container
        if (this.enablePagination && containerToScroll) {
          containerToScroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });

      this.paginationContainer.appendChild(pageButton);
    }
  }

  createReviewElement(review) {
    const reviewEl = document.createElement("div");
    reviewEl.classList.add("review");
    const { text, isLong } = truncateText(review.comment);

    // --- Photo Gallery Thumbnails ---
    let galleryHtml = "";
    if (Array.isArray(review.images) && review.images.length > 0) {
      const maxThumbs = 2;
      const thumbs = review.images.slice(0, maxThumbs);
      galleryHtml += '<div class="review-gallery">';
      thumbs.forEach((img, idx) => {
        galleryHtml += `<img src="${img}" class="review-thumb" data-idx="${idx}" alt="Review photo" />`;
      });
      if (review.images.length > maxThumbs) {
        const moreCount = review.images.length - maxThumbs;
        galleryHtml += `<div class="review-thumb more-thumb" data-idx="${maxThumbs}">+${moreCount} more</div>`;
      }
      galleryHtml += "</div>";
    }

    reviewEl.innerHTML = `<div class="single-rv style-2" >
    <div class="rv-middle">
      <div class="rating-star">${generateStarRating(review.rating)}</div>
      <div class="name-date">
      <strong>${
        review.username
      }</strong><span style="margin: 0 3px;">-</span><span>${formatDate(
      review.purchaseDate
    )}</span> 
      </div>
      <p class="rv-comment">${text}</p>
      ${galleryHtml}
      ${
        isLong
          ? `<a href="#" class="read-more">Read More 
              <svg class="angle-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18" id="angle-down">
                <path fill="#292F36" d="M2.977 6.352a.563.563 0 0 1 .796 0L9 11.58l5.227-5.228a.563.563 0 0 1 .796.796l-5.625 5.625a.56.56 0 0 1-.796 0L2.977 7.148a.56.56 0 0 1 0-.796"/>
              </svg>
             </a>`
          : ""
      }
    </div>
    <div class="rv-bottom">
      <button class="btn_style2 like-btn"><svg width="11" height="11" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" class="thumbs-up-alt"><path d="M104 224H24c-13.255 0-24 10.745-24 24v240c0 13.255 10.745 24 24 24h80c13.255 0 24-10.745 24-24V248c0-13.255-10.745-24-24-24zM64 472c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zM384 81.452c0 42.416-25.97 66.208-33.277 94.548h101.723c33.397 0 59.397 27.746 59.553 58.098.084 17.938-7.546 37.249-19.439 49.197l-.11.11c9.836 23.337 8.237 56.037-9.308 79.469 8.681 25.895-.069 57.704-16.382 74.757 4.298 17.598 2.244 32.575-6.148 44.632C440.202 511.587 389.616 512 346.839 512l-2.845-.001c-48.287-.017-87.806-17.598-119.56-31.725-15.957-7.099-36.821-15.887-52.651-16.178-6.54-.12-11.783-5.457-11.783-11.998v-213.77c0-3.2 1.282-6.271 3.558-8.521 39.614-39.144 56.648-80.587 89.117-113.111 14.804-14.832 20.188-37.236 25.393-58.902C282.515 39.293 291.817 0 312 0c24 0 72 8 72 81.452z" fill="#9b9898"></path></svg><span class="${
        review.liked > 0 ? "ml-3" : ""
      }">${review.liked == 0 ? "" : review.liked}</span></button>
       <a href="${
         review.shareLinks
       }" target="_blank" class="btn_style2 dropdown-btn"><svg width="12" height="12" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="share-icon"><path d="M94.51,39.22a.28.28,0,0,0,0-.09v0h0v-.25c0-.06,0-.13,0-.19s0-.09,0-.13h0a3.13,3.13,0,0,0-1-2L70.61,13.67c-.83-.83-1.66-1.67-2.5-2.49a3,3,0,0,0-3.56-.57,3.14,3.14,0,0,0-1.8,3q0,6.16,0,12.33c0,.23-.07.27-.29.27H51.28q-4.76,0-9.5.43c-2.12.2-4.23.47-6.32.85A54.76,54.76,0,0,0,25.79,30a35.34,35.34,0,0,0-8.34,4.38A26.18,26.18,0,0,0,8.16,46.27,36.86,36.86,0,0,0,6,55.64c-.23,1.91-.32,3.84-.38,5.77a32.1,32.1,0,0,0,.61,7A58.75,58.75,0,0,0,8.25,76c1.29,3.8,2.87,7.48,4.51,11.14A8.41,8.41,0,0,0,13.83,89a1.59,1.59,0,0,0,1.65.64,1.5,1.5,0,0,0,1.13-1.12,2.6,2.6,0,0,0,0-1.11c-.19-1.38-.28-2.77-.35-4.16a54.88,54.88,0,0,1,.23-9.76,33.4,33.4,0,0,1,1.71-7.25,18.41,18.41,0,0,1,4-6.63,22.51,22.51,0,0,1,9.26-5.71A44.83,44.83,0,0,1,39,52.32c2-.29,4-.46,6-.57,2.27-.13,4.55-.16,6.83-.17H62.52c.19,0,.24.05.24.23q0,3.54,0,7.06c0,1.79,0,3.58,0,5.36a3.17,3.17,0,0,0,5.53,2.19l19-19,6.31-6.3a3.19,3.19,0,0,0,.94-1.79s0,0,0-.07Z" fill="#9b9898" class="cls-2"></path></svg>Share</a>
    </div>
  </div>`;

    // --- Photo Gallery Click Handlers ---
    if (Array.isArray(review.images) && review.images.length > 0) {
      const gallery = reviewEl.querySelector(".review-gallery");
      if (gallery) {
        gallery.addEventListener("click", (e) => {
          let target = e.target;
          if (target.classList.contains("review-thumb")) {
            let idx = parseInt(target.getAttribute("data-idx"));
            if (isNaN(idx)) idx = 0;
            openPhotoGallery(review.images, idx);
          }
        });
      }
    }

    // Add like button functionality
    const likeButton = reviewEl.querySelector(".like-btn");
    const likeCount = likeButton.querySelector("span");

    likeButton.addEventListener("click", () => {
      // Toggle the active state
      const isActive = likeButton.classList.toggle("active");

      // Update the like count
      let currentCount = parseInt(likeCount.textContent) || 0;
      currentCount = isActive ? currentCount + 1 : currentCount - 1;

      // Show count only if it's greater than 0
      if (currentCount > 0) {
        likeCount.textContent = currentCount;
        likeCount.classList.add("ml-3");
      } else {
        likeCount.textContent = "";
        likeCount.classList.remove("ml-3");
      }
    });

    if (isLong) {
      const toggleButton = reviewEl.querySelector(".read-more");
      const arrowIcon = toggleButton.querySelector(".angle-icon");
      arrowIcon.style.display = "inline-block";
      toggleButton.addEventListener("click", (event) => {
        event.preventDefault();
        const commentEl = reviewEl.querySelector(".rv-comment");
        if (toggleButton.innerText.includes("Read More")) {
          commentEl.innerText = review.comment;
          toggleButton.innerHTML = "Read less";
          toggleButton.appendChild(arrowIcon);
          arrowIcon.style.transform = "rotate(180deg)"; // Rotate arrow down for "Show less"
        } else {
          commentEl.innerText = text;
          toggleButton.innerHTML = "Read More";
          toggleButton.appendChild(arrowIcon);
          arrowIcon.style.transform = "rotate(0deg)"; // Reset rotation for "Show more"
        }
      });
    }

    return reviewEl;
  }

  //   calcualte average rating
  calculateRatingStats() {
    const totalReviews = this.reviews.length;
    if (totalReviews === 0) {
      return {
        avgRating: "0",
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        totalReviews: 0,
      };
    }

    let totalRating = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    this.reviews.forEach((review) => {
      totalRating += review.rating;
      ratingCounts[review.rating] += 1;
    });

    const avgRating = (totalRating / totalReviews).toFixed(1);

    if (document.getElementById("avg_rating_1") !== null) {
      document.getElementById("avg_rating_1").innerHTML = `${avgRating}/5`;
    }

    return { avgRating, ratingCounts, totalReviews };
  }

  renderRatingWidgetStats() {
    const { avgRating, ratingCounts, totalReviews } =
      this.calculateRatingStats();

    // Rating bars for each star level
    const ratingBars = Object.entries(ratingCounts)
      .sort((a, b) => b[0] - a[0]) // Sort by star level in descending order (5 to 1)
      .map(([star, count]) => {
        const percentage = ((count / totalReviews) * 100).toFixed(1); // Percentage of reviews for this rating

        return `
        <div class="rating-bar">
          <div class="bar-values"><span>${star} ${
          parseInt(star) > 1 ? "Stars" : "Star"
        } </span>
           <span>${count}</span></div>
          <div class="bar">
            <div class="fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      })
      .join("");

    // Average rating display
    const avgRatingDisplay = `
    <div class="avg-rating">
      
      <div class="avg-stars">
        <img src="${starFilled}" alt="*" />
        <img src="${starFilled}" alt="*" />
        <img src="${starFilled}" alt="*" />
        <img src="${starFilled}" alt="*" />
        <img src="${starFilled}" alt="*" />
      </div>
      <div class="avg-dropdwon">
          <button class="trigger">
            <span><strong class="f-rate">${avgRating}</strong>/5</span><img src="${caretDownIcon}" alt="" />
          </button>
          <div class="rating-bar-wrap">${ratingBars}</div>
      </div>
    </div>
  `;

    // Insert into widget area
    const rvWidgetAvg = document.getElementById("rv-widget-avg");
    rvWidgetAvg.innerHTML = avgRatingDisplay;
  }
}
