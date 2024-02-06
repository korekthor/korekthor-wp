export const clone_template = (template_id: string) => {
  const template = document.getElementById(template_id) as HTMLTemplateElement | null;
  if (!template) throw new Error(`Template with id ${template_id} not found!`);
  return template.content.cloneNode(true) as DocumentFragment;
};

export const apply_template = (template_id: string, push = false) => {
  const main = document.getElementById("korekthor-classic-main");
  if (!main) return;

  const content = clone_template(template_id);
  main.innerHTML = "";

  if (push) {
    // clear main
    main.appendChild(content);
  }

  return { content, main };
};
