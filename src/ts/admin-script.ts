const onWindowLoad = () => {
  const links =
    document.querySelectorAll<HTMLAnchorElement>("ul.nav-tabs > li a");
  const pages = document.querySelectorAll("div.tab-content > .tab-pane");

  // get the # from url

  const switchTab = (link: HTMLAnchorElement, ev: MouseEvent) => {
    ev.preventDefault();
    const id = link.getAttribute("href");
    const page = document.querySelector(id);

    pages.forEach((p) => p.classList.remove("active"));
    links.forEach((link) => link.parentElement!.classList.remove("active"));

    link.parentElement.classList.add("active");
    page.classList.add("active");
  };

  links.forEach((link) => {
    link.addEventListener("click", (ev) => switchTab(link, ev));
  });
};

window.addEventListener("load", onWindowLoad);
