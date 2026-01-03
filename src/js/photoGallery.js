// photoGallery.js
// Handles modal photo gallery with carousel for review images

export function openPhotoGallery(images, startIndex = 0) {
  // Create modal overlay
  let modal = document.createElement("div");
  modal.className = "photo-gallery-modal";
  modal.innerHTML = `
    <div class="photo-gallery-content">
      <button class="photo-gallery-arrow left"><svg viewBox="-19.04 0 75.803 75.803" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Group_64" data-name="Group 64" transform="translate(-624.082 -383.588)"> <path id="Path_56" data-name="Path 56" d="M660.313,383.588a1.5,1.5,0,0,1,1.06,2.561l-33.556,33.56a2.528,2.528,0,0,0,0,3.564l33.556,33.558a1.5,1.5,0,0,1-2.121,2.121L625.7,425.394a5.527,5.527,0,0,1,0-7.807l33.556-33.559A1.5,1.5,0,0,1,660.313,383.588Z" fill="#fff"></path> </g> </g></svg></button>
      <img class="photo-gallery-image" src="" alt="Review Photo" />
      <button class="photo-gallery-arrow right"><svg viewBox="-19.04 0 75.804 75.804" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Group_65" data-name="Group 65" transform="translate(-831.568 -384.448)"> <path id="Path_57" data-name="Path 57" d="M833.068,460.252a1.5,1.5,0,0,1-1.061-2.561l33.557-33.56a2.53,2.53,0,0,0,0-3.564l-33.557-33.558a1.5,1.5,0,0,1,2.122-2.121l33.556,33.558a5.53,5.53,0,0,1,0,7.807l-33.557,33.56A1.5,1.5,0,0,1,833.068,460.252Z" fill="#fff"></path> </g> </g></svg></button>
      <div class="photo-gallery-counter"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const imgEl = modal.querySelector(".photo-gallery-image");
  const leftBtn = modal.querySelector(".photo-gallery-arrow.left");
  const rightBtn = modal.querySelector(".photo-gallery-arrow.right");
  const counter = modal.querySelector(".photo-gallery-counter");

  let currentIndex = startIndex;

  function updateImage() {
    imgEl.src = images[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${images.length}`;
    leftBtn.style.display = images.length > 1 ? "" : "none";
    rightBtn.style.display = images.length > 1 ? "" : "none";
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  leftBtn.addEventListener("click", showPrev);
  rightBtn.addEventListener("click", showNext);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      document.body.removeChild(modal);
      document.removeEventListener("keydown", escListener);
    }
  });

  updateImage();
}
