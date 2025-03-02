/**
 * Logger module for handling event logging
 */

/**
 * Log a message to the log container
 * @param {string} msg - The message to log
 * @param {string} [type] - The type of message (e.g., "error")
 */
export const logMessage = (msg, type) => {
  const logContainer = document.getElementById("log-container");
  if (!logContainer) {
    console.error("Log container not found");
    return;
  }
  
  const entry = document.createElement("div");
  entry.className = "log-entry" + (type === "error" ? " log-error" : "");
  entry.textContent = msg;
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Also log to console for debugging
  if (type === "error") {
    console.error(msg);
  } else {
    console.log(msg);
  }
};

/**
 * Clear all log entries
 */
export const clearLog = () => {
  const logContainer = document.getElementById("log-container");
  if (!logContainer) {
    console.error("Log container not found");
    return;
  }
  
  // Keep the title element
  const title = logContainer.querySelector(".log-title");
  logContainer.innerHTML = "";
  
  if (title) {
    logContainer.appendChild(title);
  } else {
    const newTitle = document.createElement("h2");
    newTitle.className = "log-title";
    newTitle.textContent = "Event Log";
    logContainer.appendChild(newTitle);
  }
};

/**
 * Filter log entries by type
 * @param {string} type - The type of log entries to show
 */
export const filterLog = (type) => {
  const logContainer = document.getElementById("log-container");
  if (!logContainer) {
    console.error("Log container not found");
    return;
  }
  
  const entries = logContainer.querySelectorAll(".log-entry");
  entries.forEach(entry => {
    if (type === "all" || (type === "error" && entry.classList.contains("log-error")) || 
        (type === "info" && !entry.classList.contains("log-error"))) {
      entry.style.display = "";
    } else {
      entry.style.display = "none";
    }
  });
};

export default {
  logMessage,
  clearLog,
  filterLog
};