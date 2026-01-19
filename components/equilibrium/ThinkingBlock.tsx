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

    // Section headers: === SECTION NAME === (handles multiple = signs)
    const headerMatch = line.match(/^=+\s*(.+?)\s*=+$/);
    if (headerMatch) {
      sections.push({ type: "header", content: headerMatch[1] });
      i++;
      continue;
    }

    // Extension lines: EXTENSION IV: Name — STATUS or EXT-IV: Name — STATUS
    // Also handles formats like "EXTENSION IV: PRINCIPAL-AGENT — ACTIVE"
    const extMatch = line.match(
      /^(?:EXTENSION\s+)?([IVX]+|EXT-[IVX]+)[\s:]+(.+?)\s*[—-]\s*(ACTIVE|LIKELY|POSSIBLE|PRIMARY|SECONDARY|INACTIVE|MONITORING)/i
    );
    if (extMatch) {
      // Collect following lines as detail until next section/extension
      let detail = "";
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (
          !nextLine ||
          nextLine.match(/^=+\s*.+\s*=+$/) ||
          nextLine.match(/^(?:EXTENSION\s+)?[IVX]+[\s:]/) ||
          nextLine.match(/^[A-Z][A-Za-z_]*\s*[:=]/) ||
          nextLine.match(/^Where\s+/i) ||
          nextLine.match(/^His\s+/i) ||
          nextLine.match(/^Her\s+/i)
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

    // Equations: lines with utility function or math notation
    // Check this BEFORE parameters to catch "U_M = α·A(Q_f) + β·O..." style lines
    const isEquation =
      line.includes("=") &&
      (line.includes("×") ||
        line.includes("·") ||
        line.includes("∂") ||
        line.includes("→") ||
        line.includes("∈") ||
        line.includes("≥") ||
        line.includes("≤") ||
        line.includes("−") || // minus sign (different from hyphen)
        line.match(/[α-ωΑ-Ω]/) ||
        line.match(/\^[{(]/) ||
        line.match(/[A-Z]_[A-Z]\s*=/) || // U_M = pattern
        line.match(/\([A-Za-z_,]+\)/)); // function notation like A(Q_f)

    if (isEquation) {
      sections.push({ type: "equation", content: line });
      i++;
      continue;
    }

    // Parameter lines: MP_M: value or MP_M = value
    // Also handles "His current utility: U_M = ..." and similar descriptive lines
    const paramMatch = line.match(/^([A-Za-z][A-Za-z0-9_\s]*(?:\^[A-Za-z]+)?)\s*[:]\s*(.+)$/);
    if (paramMatch && !line.includes("===")) {
      // Collect continuation lines (starting with - or indented)
      let fullValue = paramMatch[2];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (
          !nextLine ||
          nextLine.match(/^=+\s*.+\s*=+$/) ||
          nextLine.match(/^(?:EXTENSION\s+)?[IVX]+[\s:]/) ||
          (nextLine.match(/^[A-Z][A-Za-z_\s]*:/) && !nextLine.startsWith("-"))
        ) {
          break;
        }
        // If it's a continuation (starts with - or is indented context)
        if (nextLine.startsWith("-") || nextLine.startsWith("•")) {
          fullValue += " " + nextLine;
          i++;
        } else {
          break;
        }
      }
      sections.push({
        type: "parameter",
        content: line,
        data: {
          param: paramMatch[1].trim(),
          value: fullValue,
        },
      });
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

    // Lines starting with "Where" are typically equation context
    if (line.match(/^Where\s+/i)) {
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
    <div className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 first:mt-0 sm:mb-4 sm:mt-6 sm:text-[11px]">
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
      className={`mb-2.5 rounded-lg border-l-2 bg-white/[0.02] p-3 sm:mb-3 sm:p-3.5 sm:px-4 ${
        isActive ? "border-accent" : "border-neutral-700"
      }`}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2 sm:mb-2 sm:gap-3">
        <span className="text-[11px] text-neutral-600 sm:text-xs">{id}</span>
        <span className="text-[11px] text-neutral-200 sm:text-xs">{name}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.05em] sm:px-2 sm:text-[10px] ${
            isActive ? "bg-accent/15 text-accent" : "bg-white/[0.05] text-neutral-500"
          }`}
        >
          {status}
        </span>
      </div>
      {detail && <div className="text-[10px] text-neutral-500 sm:text-xs">{detail}</div>}
    </div>
  );
}

function ParameterLine({ param, value }: { param: string; value: string }) {
  // Check if value contains bullet points
  const hasBullets = value.includes(" - ") || value.includes(" • ");

  if (hasBullets) {
    // Split into parts and render as a list
    const parts = value.split(/\s*[-•]\s+/).filter(Boolean);
    return (
      <div className="border-b border-white/[0.04] py-2.5 last:border-0 sm:py-3">
        <div className="mb-1.5 text-[11px] text-accent sm:mb-2 sm:text-xs">{param}</div>
        <div className="ml-2 space-y-1">
          {parts.map((part, i) => (
            <div key={i} className="flex gap-2 text-[10px] text-neutral-500 sm:text-xs">
              <span className="flex-shrink-0 text-neutral-600">→</span>
              <span>{part}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if value has a separation pattern (value | explanation or value, explanation)
  // Match patterns like "40-70th %ile | Broad range" or "Declining | Distance indicates"
  const separatorMatch = value.match(/^([^|,]+?)\s*[|,]\s*(.+)$/);

  if (separatorMatch) {
    const [, mainValue, explanation] = separatorMatch;
    return (
      <div className="flex flex-col gap-1 rounded-md bg-white/[0.02] px-3 py-2 text-[10px] sm:grid sm:grid-cols-[140px_140px_1fr] sm:gap-4 sm:px-3.5 sm:py-2.5 sm:text-xs">
        <span className="flex-shrink-0 text-accent">{param}</span>
        <span className="text-neutral-400">{mainValue.trim()}</span>
        <span className="text-neutral-600">{explanation.trim()}</span>
      </div>
    );
  }

  // Simple two-column layout for param: value
  return (
    <div className="flex flex-col gap-1 rounded-md bg-white/[0.02] px-3 py-2 text-[10px] sm:grid sm:grid-cols-[140px_1fr] sm:gap-4 sm:px-3.5 sm:py-2.5 sm:text-xs">
      <span className="flex-shrink-0 text-accent">{param}</span>
      <span className="text-neutral-500">{value}</span>
    </div>
  );
}

function EquationLine({ content }: { content: string }) {
  // Check if it's a "Where" line (contextual explanation)
  const isWhereClause = content.match(/^Where\s+/i);

  if (isWhereClause) {
    return (
      <div className="my-1.5 text-[10px] text-neutral-500 sm:my-2 sm:text-[12px]">
        {content}
      </div>
    );
  }

  // Check if it starts with a label like "His current utility:"
  const labelMatch = content.match(/^([^:=]+):\s*(.+)$/);
  if (labelMatch && !content.includes("===")) {
    return (
      <div className="my-1.5 sm:my-2">
        <div className="mb-1 text-[10px] text-neutral-600 sm:text-[11px]">{labelMatch[1]}</div>
        <div className="overflow-x-auto rounded bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-neutral-300 sm:px-3 sm:py-2 sm:text-xs">{labelMatch[2]}</div>
      </div>
    );
  }

  return (
    <div className="my-1.5 overflow-x-auto rounded bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-neutral-300 sm:my-2 sm:px-3 sm:py-2 sm:text-xs">{content}</div>
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
    <div className="my-2.5 overflow-x-auto sm:my-3">
      <table className="w-full text-[10px] sm:text-[12px]">
        <tbody>
          {dataRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={isHeader(rowIdx) ? "border-b border-white/[0.1]" : ""}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`px-1.5 py-1 sm:px-2 sm:py-1.5 ${
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
    return <div className="ml-3 text-[10px] text-neutral-500 sm:ml-4 sm:text-xs">{content}</div>;
  }
  return <div className="text-[10px] text-neutral-500 sm:text-xs">{content}</div>;
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
    <div className="rounded-lg border border-white/[0.06] border-l-2 border-l-accent/30 bg-black/40 p-4 font-mono text-xs leading-relaxed sm:rounded-[10px] sm:p-6 sm:text-[13px] sm:leading-[1.7]">
      {grouped.map((item, i) => {
        // Parameter group
        if (Array.isArray(item)) {
          return (
            <div key={i} className="mb-3 flex flex-col gap-1.5 sm:mb-4 sm:gap-2">
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
