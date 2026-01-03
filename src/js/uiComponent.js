export class AB_Accordion {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Accordion container with ID "${containerId}" not found.`);
      return;
    }

    this.init();
  }

  init() {
    const buttons = this.container.querySelectorAll(".accordion-button");

    buttons.forEach((button) => {
      // Add the dynamic icon to the button
      const icon = document.createElement("span");
      icon.classList.add("accordion-icon");
      icon.innerHTML = `
        <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 18 18" font-size="1.125rem"><path fill="#292F36" d="M2.977 6.352a.563.563 0 0 1 .796 0L9 11.58l5.227-5.228a.563.563 0 0 1 .796.796l-5.625 5.625a.56.56 0 0 1-.796 0L2.977 7.148a.56.56 0 0 1 0-.796"></path></svg>`;
      button.appendChild(icon);

      // Add click event listener
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        const contentId = button.getAttribute("aria-controls");
        const content = document.getElementById(contentId);

        if (!content) {
          console.warn(`Content with ID "${contentId}" not found.`);
          return;
        }

        // Toggle current section
        this.toggleSection(button, content, !expanded);

        // Close other sections if needed
        this.closeOtherSections(button);
      });
    });
  }

  toggleSection(button, content, expand) {
    button.setAttribute("aria-expanded", expand);
    content.setAttribute("aria-hidden", !expand);

    if (expand) {
      content.style.height = `${content.scrollHeight}px`; // Set height for smooth expand
      content.addEventListener(
        "transitionend",
        () => {
          if (expand) content.style.height = "auto"; // Reset to auto after expand
        },
        { once: true }
      );
    } else {
      content.style.height = `${content.scrollHeight}px`; // Set height to current height first
      // Force reflow to apply the new height (fix for transition not triggering)
      content.offsetHeight;
      content.style.height = "0"; // Smooth collapse
    }
  }

  closeOtherSections(activeButton) {
    const buttons = this.container.querySelectorAll(".accordion-button");
    buttons.forEach((button) => {
      if (button !== activeButton) {
        const contentId = button.getAttribute("aria-controls");
        const content = document.getElementById(contentId);

        if (content) {
          this.toggleSection(button, content, false);
        }
      }
    });
  }
}

export class OffCanvasController {
  constructor(offCanvasId, openButtonId, closeButtonId) {
    this.offCanvas = document.getElementById(offCanvasId);
    this.openButton = document.getElementById(openButtonId);
    this.closeButton = document.getElementById(closeButtonId);

    // Bind events
    this.openButton.addEventListener("click", () => this.show());
    this.closeButton.addEventListener("click", () => this.hide());
  }

  show() {
    this.offCanvas.classList.add("show");
    this.openButton.style.display = "none";
  }

  hide() {
    this.offCanvas.classList.remove("show");
    this.openButton.style.display = "flex";
  }
}

export class Tab {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tabButtons = this.container.querySelectorAll(".tab-button");
    this.tabPanes = this.container.querySelectorAll(".tab-pane");
    this.initTabs();
  }

  initTabs() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Deactivate all buttons and panes
        this.tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.tabPanes.forEach((pane) => pane.classList.remove("active"));

        // Activate the clicked button and corresponding pane
        button.classList.add("active");
        const tabId = button.getAttribute("data-tab");
        this.container.querySelector(`#tab-${tabId}`).classList.add("active");
      });
    });
  }
}
