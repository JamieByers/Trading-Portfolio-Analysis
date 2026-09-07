export function initNavbar() {
    const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
    const mobileNavbar = document.querySelector<HTMLElement>('#mobileNavbar');

    toggle?.addEventListener('click', () => {
        mobileNavbar?.classList.toggle('open');
    });

}

