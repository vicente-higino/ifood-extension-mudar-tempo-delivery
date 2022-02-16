import React from "react";
import ReactDOM from "react-dom";
import { Popup } from "./popup";

const app = document.createElement("div");
app.id = "extRoot";
document.getElementsByTagName("body")[0].appendChild(app);
ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("extRoot")
);
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "clicked_browser_action") {
    toggle();
  }
});

export function toggle() {
  if (app.style.display === "none") {
    app.style.display = "block";
  } else {
    app.style.display = "none";
  }
}
export function show() {
  app.style.display = "block";
}

export function hide() {
  app.style.display = "none";
}
