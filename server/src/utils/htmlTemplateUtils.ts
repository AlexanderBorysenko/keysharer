import { readFile } from "fs/promises";

export async function renderTemplate(
	templateName: string,
	data: Record<string, string>
): Promise<string> {
	const templatePath =
		__dirname + `/../resources/templates/${templateName}.html`;

	let template = await readFile(templatePath, "utf-8");

	Object.keys(data).forEach((key) => {
		const placeholder = `{{${key}}}`;
		if (template.includes(placeholder)) {
			template = template.replace(
				new RegExp(placeholder, "g"),
				data[key]
			);
		}
	});

	return template;
}
