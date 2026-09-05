# musescore-mcp

This is an MCP server that lets AI models read and write MuseScore `.mscx` lead sheets.

Reading and writing raw xml is possible, but it uses up context faster, the AI has to know the schema, and it's less creative when it has to think about the technical details.

To this end, musescore-mcp provides a set of tools for creating scores, reading and writing notation, and manipulating song structure. It also has a custom domain-specific language that presents the music in a clear, concise way, letting the AI focus on the music without wasting context and attention on the technicalities of XML.

Built with TypeScript and [Bun](https://bun.sh). See more about what MCP is and how it works here: [Model Context Protocol](https://modelcontextprotocol.io).

## Tools

| Tool                 | Description                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_score`       | Creates a new `.mscx` score file with a header, instruments, key and time signatures, a tempo marker, and empty measures.                          |
| `get_overview`       | Returns the chart summary: header texts, instruments with transposition, key and time signatures, tempo, bar count, and which bars contain melody. |
| `read_measures`      | Returns bar notation for a range of measures: notes as written pitch, rests, and durations with dots, separated by `\|`.                           |
| `write_measures`     | Replaces the content of consecutive bars with the given notation. Each bar must fill the time signature exactly.                                   |
| `insert_measures`    | Inserts empty bars before a measure. Time and key signatures at bar 1 stay at bar 1.                                                               |
| `delete_measures`    | Deletes a range of bars.                                                                                                                           |
| `set_header`         | Sets the header frame texts of a score: title, subtitle, composer, lyricist. Only the given fields change.                                         |
| `set_key_signature`  | Sets a key signature change at the start of a measure, in all staves.                                                                              |
| `set_time_signature` | Sets a time signature change at the start of a measure, in all staves. Affected measures must be empty.                                            |
| `set_tempo`          | Sets a tempo change at the start of a measure, on the first staff.                                                                                 |
| `set_section_marker` | Sets a rehearsal mark at a measure, replacing any existing mark there.                                                                             |
| `set_barline`        | Sets the barline type at a measure: start-repeat, end-repeat (with optional play count), double, or normal.                                        |
| `add_volta`          | Adds a volta (ending bracket) over an inclusive measure range.                                                                                     |
| `set_layout_break`   | Sets a layout break at a measure: system, page, or section. Type `none` removes the break.                                                         |
| `set_text`           | Sets a staff or system text at the start of a measure, with optional swing feel.                                                                   |

### Notation example

`read_measures` and `write_measures` use a compact text notation.

Blue Bossa for tenor saxophone:

```
A4:4 |
[D-7] A5:4. G5:8 F5 E5 r D5~ | D5:2. C5:4 |
[G-7] B♭4:2 A5:4. G5:8~ | G5:2. r:4 |
[E07] G5:4. F5:8 E5 D5 r C5~ | [A7] C5:2. B♭4:4 |
[D-7] A4:2 G5:4. F5:8~ | F5:2. r:4
```

This shows both harmony and melody with note durations.

## Setup

Requires [Bun](https://bun.sh).

```bash
bun install
```

Then add the server to your agent of choice:

<details>
<summary>OpenCode</summary>

Add to `opencode.json` in your project root or `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "musescore": {
      "type": "local",
      "command": ["bun", "run", "/path/to/musescore-mcp/src/index.ts"],
      "enabled": true
    }
  }
}
```

OpenCode uses `mcp` instead of `mcpServers`, combines the command and args into a single array, and requires `"type": "local"`.
</details>

<details>
<summary>Claude Code</summary>

```bash
claude mcp add musescore -- bun run /path/to/musescore-mcp/src/index.ts
```

Or add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "musescore": {
      "command": "bun",
      "args": ["run", "/path/to/musescore-mcp/src/index.ts"]
    }
  }
}
```

</details>

<details>
<summary>Cursor</summary>

Add to `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` for global access):

```json
{
  "mcpServers": {
    "musescore": {
      "command": "bun",
      "args": ["run", "/path/to/musescore-mcp/src/index.ts"]
    }
  }
}
```

</details>

<details>
<summary>Windsurf</summary>

Add to `~/.codeium/windsurf/mcp_config.json`, or open it from the Command Palette with "Windsurf: Configure MCP Servers":

```json
{
  "mcpServers": {
    "musescore": {
      "command": "bun",
      "args": ["run", "/path/to/musescore-mcp/src/index.ts"]
    }
  }
}
```

</details>

<details>
<summary>VS Code (Copilot)</summary>

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "musescore": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "/path/to/musescore-mcp/src/index.ts"]
    }
  }
}
```

Note that VS Code uses `servers` instead of `mcpServers`, and requires the `"type": "stdio"` field.
</details>

<details>
<summary>Cline</summary>

Open the MCP Servers panel in Cline and click "Configure MCP Servers", then add:

```json
{
  "mcpServers": {
    "musescore": {
      "command": "bun",
      "args": ["run", "/path/to/musescore-mcp/src/index.ts"]
    }
  }
}
```

</details>

<details>
<summary>Codex CLI</summary>

```bash
codex mcp add musescore -- bun run /path/to/musescore-mcp/src/index.ts
```

Or add to `~/.codex/config.toml`:

```toml
[mcp_servers.musescore]
command = "bun"
args = ["run", "/path/to/musescore-mcp/src/index.ts"]
```

</details>

## License

AGPL-3.0
