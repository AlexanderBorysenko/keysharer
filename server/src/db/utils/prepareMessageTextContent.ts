import xss, { type IFilterXSSOptions } from "xss";
import DOMPurify from "isomorphic-dompurify";

export const prepareMessageTextContent = (content: string): string => {
	const xssOptions: IFilterXSSOptions = {
		onIgnoreTagAttr: function (
			tag: string,
			name: string,
			value: string,
			isWhiteAttr: boolean
		) {
			if (tag === "a" && name === "href") {
				return "href";
			}
		},
	};
	content = xss(content, xssOptions);
	content = DOMPurify.sanitize(content);

	return content;
};
