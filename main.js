import "./src/styles/photoGallery.css";
import "./src/styles/style.css";
import "./src/styles/main.css";

import { ReviewManager } from "./src/js/reviewManager";
import { OffCanvasController, Tab } from "./src/js/uiComponent";
import "./src/js/lightwidget.js";

document.addEventListener("DOMContentLoaded", async () => {
  const rvWidgetManager = new ReviewManager(
    "rv-widget-container",
    "rv-widget-control",
    10,
    false,
    true
  );
  rvWidgetManager.init().then(() => {
    rvWidgetManager.renderRatingWidgetStats();
    rvWidgetManager.calculateRatingStats();
  });

  // create tab instance
  const tab = new Tab("tabs");

  // create offcanvas widget instance
  const offCanvasController = new OffCanvasController(
    "offcanvas-widget",
    "open-widget-button",
    "close-widget-button"
  );
});
