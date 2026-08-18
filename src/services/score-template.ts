import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";

type ScoreShellValues = {
	title: string;
	composer: string;
	parts: string[];
	staves: string[];
};

const document = new DOMImplementation().createDocument(null, "fragment");
const serializer = new XMLSerializer();

function xmlText(value: string): string {
	return serializer.serializeToString(document.createTextNode(value));
}

export function renderScoreShell(values: ScoreShellValues): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<museScore version="4.50">
  <Score>
    <Division>480</Division>
    <metaTag name="arranger"></metaTag>
    <metaTag name="audioComUrl"></metaTag>
    <metaTag name="composer">${xmlText(values.composer)}</metaTag>
    <metaTag name="copyright"></metaTag>
    <metaTag name="lyricist"></metaTag>
    <metaTag name="movementNumber"></metaTag>
    <metaTag name="movementTitle"></metaTag>
    <metaTag name="platform"></metaTag>
    <metaTag name="poet"></metaTag>
    <metaTag name="source"></metaTag>
    <metaTag name="sourceRevisionId"></metaTag>
    <metaTag name="subtitle"></metaTag>
    <metaTag name="translator"></metaTag>
    <metaTag name="workNumber"></metaTag>
    <metaTag name="workTitle">${xmlText(values.title)}</metaTag>
${values.parts.join("\n")}
${values.staves.join("\n")}
    </Score>
  </museScore>
`;
}
