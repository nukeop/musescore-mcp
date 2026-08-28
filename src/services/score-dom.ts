import type { Document, Element, Node } from "@xmldom/xmldom";

export function childElements(parent: Node): Element[] {
	return Array.from(parent.childNodes).filter((node): node is Element => node.nodeType === node.ELEMENT_NODE);
}

export function children(parent: Node, name: string): Element[] {
	return childElements(parent).filter((element) => element.nodeName === name);
}

export function child(parent: Node, name: string): Element | undefined {
	return children(parent, name)[0];
}

export function numberIn(parent: Element, name: string): number {
	return Number(child(parent, name)?.textContent);
}

export function textIn(parent: Element, name: string): string {
	return child(parent, name)?.textContent ?? "";
}

export function elementWithText(document: Document, name: string, value: string): Element {
	const element = document.createElement(name);
	element.textContent = value;
	return element;
}

export function textElementIn(document: Document, parent: Element): Element {
	const existing = child(parent, "text");
	if (existing) {
		return existing;
	}
	const created = document.createElement("text");
	parent.appendChild(created);
	return created;
}

export function removeChildren(parent: Element, name: string): void {
	children(parent, name).forEach((element) => {
		parent.removeChild(element);
	});
}

export function replaceOrPrepend(parent: Element, element: Element): void {
	const existing = child(parent, element.nodeName);
	if (existing) {
		parent.replaceChild(element, existing);
	} else {
		parent.insertBefore(element, parent.firstChild);
	}
}

export function precedingElement(element: Element): Element | undefined {
	let node = element.previousSibling;
	while (node && node.nodeType !== node.ELEMENT_NODE) {
		node = node.previousSibling;
	}
	return (node as Element) ?? undefined;
}

export function scoreElementOf(document: Document): Element | undefined {
	const root = child(document, "museScore");
	return root && child(root, "Score");
}
