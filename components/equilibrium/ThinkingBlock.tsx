"use client";

interface ThinkingBlockProps {
  content: string;
}

interface ParsedSection {
  type: "header" | "extension" | "parameter" | "equation" | "table" | "text";
  content: string;
  data?: Record<string, string>;
}

function parseThinkingContent(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Section headers: === SECTION NAME ===
    const headerMatch = line.match(/^===\s*(.+?)\s*===$/);
    if (headerMatch) {
      sections.push({ type: "header", content: headerMatch[1] });
      i++;
      continue;
    }

    // Extension lines: EXTENSION IV: Name — STATUS or EXT-IV: Name — STATUS
    const extMatch = line.match(
      /^(?:EXTENSION\s+)?([IVX]+|EXT-[IVX]+)[\s:]+(.+?)\s*[—-]\s*(ACTIVE|LIKELY|POSSIBLE|PRIMARY|SECONDARY)/i
    );
    if (extMatch) {
      // Collect following lines as detail until next section/extension
      let detail = "";
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (
          !nextLine ||
          nextLine.match(/^===/) ||
          nextLine.match(/^(?:EXTENSION\s+)?[IVX]+[\s:]/) ||
          nextLine.match(/^[A-Z_]+:/)
        ) {
          break;
        }
        detail += (detail ? " " : "") + nextLine;
        i++;
      }
      sections.push({
        type: "extension",
        content: extMatch[2],
        data: {
          id: extMatch[1].startsWith("EXT-") ? extMatch[1] : `EXT-${extMatch[1]}`,
          name: extMatch[2],
          status: extMatch[3].toUpperCase(),
          detail: detail,
        },
      });
      continue;
    }

    // Parameter lines: MP_M: value or MP_M = value
    const paramMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*(?:\^[A-Za-z]+)?)\s*[:=]\s*(.+)$/);
    if (paramMatch && !line.includes("===")) {
      sections.push({
        type: "parameter",
        content: line,
        data: {
          param: paramMatch[1],
          value: paramMatch[2],
        },
      });
      i++;
      continue;
    }

    // Pipe tables: | Header | Header |
    if (line.startsWith("|") && line.includes("|")) {
      let tableContent = line + "\n";
      i++;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableContent += lines[i].trim() + "\n";
        i++;
      }
      sections.push({ type: "table", content: tableContent.trim() });
      continue;
    }

    // Equations: lines with math symbols
    if (
      line.includes("=") &&
      (line.includes("×") ||
        line.includes("∂") ||
        line.includes("→") ||
        line.includes("∈") ||
        line.includes("≥") ||
        line.includes("≤") ||
        line.match(/[α-ωΑ-Ω]/) ||
        line.match(/\^[{(]/))
    ) {
      sections.push({ type: "equation", content: line });
      i++;
      continue;
    }

    // Default: regular text
    sections.push({ type: "text", content: line });
    i++;
  }

  return sections;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-600 first:mt-0">
      {title}
    </div>
  );
}

function ExtensionLine({
  id,
  name,
  status,
  detail,
}: {
  id: string;
  name: string;
  status: string;
  detail: string;
}) {
  const isActive = status === "ACTIVE" || status === "PRIMARY";
  return (
    <div
      className={`mb-3 rounded-lg border-l-2 bg-white/[0.02] p-3.5 px-4 ${
        isActive ? "border-accent" : "border-neutral-700"
      }`}
    >
      <div className="mb-2 flex items-center gap-3">
        <span className="text-neutral-600">{id}</span>
        <span className="text-neutral-200">{name}</span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em] ${
            isActive ? "bg-accent/15 text-accent" : "bg-white/[0.05] text-neutral-500"
          }`}
        >
          {status}
        </span>
      </div>
      {detail && <div className="text-xs text-neutral-500">{detail}</div>}
    </div>
  );
}

function ParameterLine({ param, value }: { param: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 border-b border-white/[0.04] py-2 last:border-0">
      <span className="text-accent">{param}</span>
      <span className="text-neutral-500">{value}</span>
    </div>
  );
}

function EquationLine({ content }: { content: string }) {
  return (
    <div className="my-1 rounded bg-white/[0.03] px-3 py-1.5 text-neutral-400">{content}</div>
  );
}

function TableBlock({ content }: { content: string }) {
  const rows = content.split("\n").filter((r) => r.trim());
  const parsedRows = rows.map((row) =>
    row
      .split("|")
      .filter((cell) => cell.trim())
      .map((cell) => cell.trim())
  );

  // Skip separator rows (like |---|---|)
  const dataRows = parsedRows.filter((row) => !row.every((cell) => /^[-:]+$/.test(cell)));

  if (dataRows.length === 0) return null;

  const isHeader = (idx: number) => idx === 0;

  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-[12px]">
        <tbody>
          {dataRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={isHeader(rowIdx) ? "border-b border-white/[0.1]" : ""}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`px-2 py-1.5 ${
                    isHeader(rowIdx)
                      ? "text-neutral-500 font-medium"
                      : cellIdx === 0
                      ? "text-neutral-300"
                      : "text-neutral-500"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextLine({ content }: { content: string }) {
  // Check if it looks like a sub-bullet or continuation
  if (content.startsWith("-") || content.startsWith("•")) {
    return <div className="ml-4 text-neutral-500">{content}</div>;
  }
  return <div className="text-neutral-500">{content}</div>;
}

export function ThinkingBlock({ content }: ThinkingBlockProps) {
  const sections = parseThinkingContent(content);

  // Group consecutive parameters together
  const grouped: (ParsedSection | ParsedSection[])[] = [];
  let paramBuffer: ParsedSection[] = [];

  for (const section of sections) {
    if (section.type === "parameter") {
      paramBuffer.push(section);
    } else {
      if (paramBuffer.length > 0) {
        grouped.push([...paramBuffer]);
        paramBuffer = [];
      }
      grouped.push(section);
    }
  }
  if (paramBuffer.length > 0) {
    grouped.push([...paramBuffer]);
  }

  return (
    <div className="rounded-[10px] border border-white/[0.06] border-l-2 border-l-accent/30 bg-black/40 p-6 font-mono text-[13px] leading-[1.7]">
      {grouped.map((item, i) => {
        // Parameter group
        if (Array.isArray(item)) {
          return (
            <div key={i} className="mb-4">
              {item.map((param, j) => (
                <ParameterLine
                  key={j}
                  param={param.data?.param || ""}
                  value={param.data?.value || ""}
                />
              ))}
            </div>
          );
        }

        // Single sections
        switch (item.type) {
          case "header":
            return <SectionHeader key={i} title={item.content} />;
          case "extension":
            return (
              <ExtensionLine
                key={i}
                id={item.data?.id || ""}
                name={item.data?.name || ""}
                status={item.data?.status || ""}
                detail={item.data?.detail || ""}
              />
            );
          case "equation":
            return <EquationLine key={i} content={item.content} />;
          case "table":
            return <TableBlock key={i} content={item.content} />;
          case "text":
            return <TextLine key={i} content={item.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
