let defferedPrompt;


window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.defferedPrompt = e;

    initInstallButton();
});

function initInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
    installButton.addEventListener('click', async () => {
       if (!window.defferedPrompt) return;
       window.defferedPrompt.prompt();

       const {outcome} = await defferedPrompt.userChoice;
       console.log(`User response to install : ${outcome}`);

       window.defferedPrompt = null;
       installButton.hidden = true;
    });
}
}

window.addEventListener('appinstalled', () => {
    const installButton = document.getElementById('install-button');
    window.defferedPrompt = null;
    if (installButton) {
        installButton.hidden = true;
    }
    console.log('PWA installed successfully');
});
