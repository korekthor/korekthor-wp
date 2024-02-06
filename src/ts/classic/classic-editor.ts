const apply_template = (template_id: string) => {
  const main = document.getElementById("korekthor-classic-main");
  const template = document.getElementById(template_id) as HTMLTemplateElement | null;

  if (!main || !template) return;

  const clone = template.content.cloneNode(true);

  // clear main
  main.innerHTML = "";
  main.appendChild(clone);
};

const setup_idle_template = () => {
  apply_template("korekthor-classic-idle");

  // add event listener to start button
  const start_button = document.getElementById("korekthor-check-button");
  if (!start_button) return;

  start_button.addEventListener("click", () => {
    apply_template("korekthor-classic-running");
  });
};

export const main = () => {
  setup_idle_template();
  console.log("Hello from classic editor script!");
};
