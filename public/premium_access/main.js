let deferredPrompt;

// 1. Capture the hidden browser install invitation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Stop the tiny search bar icon from being the only indicator
  deferredPrompt = e;  // Save it for when they click
  
  // Show our big friendly top banner
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.hidden = false;
  }
});

// 2. Set up the button actions once the DOM fully loads
document.addEventListener('DOMContentLoaded', () => {
  const acceptBtn = document.getElementById('pwa-accept-btn');
  const closeBtn = document.getElementById('pwa-close-btn');
  const banner = document.getElementById('pwa-install-banner');

  // If the user lands on a page and the event already fired, show the banner
  if (deferredPrompt && banner) {
    banner.hidden = false;
  }

  // When they click "Pasang Sekarang"
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      // Trigger the giant browser pop-out prompt
      deferredPrompt.prompt();
      
      // Wait for their response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User installation choice: ${outcome}`);
      
      // Clear the prompt and hide the banner
      deferredPrompt = null;
      if (banner) banner.hidden = true;
    });
  }

  // If they click "Nanti Saja", hide it for this session so it doesn't annoy them
  if (closeBtn && banner) {
    closeBtn.addEventListener('click', () => {
      banner.hidden = true;
    });
  }
});

// 3. Hide the banner immediately if they install it successfully
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.hidden = true;
  }
  console.log('App successfully installed!');
});