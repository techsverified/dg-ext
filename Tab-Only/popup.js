document.addEventListener('DOMContentLoaded', function () {
  
    // sidepanel bttn
  const openPanelButton = document.getElementById('openPanelButton');
  
    openPanelButton.addEventListener('click', async function () {
        chrome.sidePanel.open();
    });
  });
  