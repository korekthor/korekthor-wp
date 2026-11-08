import React from "react";
import { ObjectElement } from "../../../jakubuv-uzasny-highlighter";
import MistakeItem from "./MistakeItem";
import { Button } from "@wordpress/components";

export interface MistakeSection {
  id: "title" | "perex" | "text" | string;
  label: string;
  mistakes: ObjectElement[];
  acceptAll?: () => void;
  rejectAll?: () => void;
}

interface MistakeListProps {
  sections?: MistakeSection[];
  mistakes?: ObjectElement[];
  warningMessage?: string | null;
  acceptAll?: () => void;
  rejectAll?: () => void;
  acceptAllGlobal?: () => void;
  rejectAllGlobal?: () => void;
  onRecheck?: () => void;
}

const getMistakeNoun = (count: number): string => {
  if (count === 1) return "chyba";
  if (count >= 2 && count <= 4) return "chyby";
  return "chyb";
};

const MistakeList: React.FC<MistakeListProps> = ({
  sections,
  mistakes,
  warningMessage,
  acceptAll,
  rejectAll,
  acceptAllGlobal,
  rejectAllGlobal,
  onRecheck,
}) => {
  const onAcceptAll = acceptAllGlobal || acceptAll;
  const onRejectAll = rejectAllGlobal || rejectAll;

  const sectionsToRender: MistakeSection[] = sections || [
    {
      id: "text",
      label: "Text",
      mistakes: mistakes || [],
      acceptAll,
      rejectAll,
    },
  ];

  return (
    <div className="korekthor-mistake-list">
      <div className="korekthor-buttons">
        {onAcceptAll && (
          <Button isPrimary onClick={onAcceptAll}>
            Přijmout všechny návrhy
          </Button>
        )}
        {onRejectAll && (
          <Button isSecondary onClick={onRejectAll}>
            Odmítnout všechny návrhy
          </Button>
        )}
      </div>

      {onRecheck && (
        <div className="korekthor-recheck-wrapper">
          <Button variant="link" onClick={onRecheck}>
            ↻ Překontrolovat
          </Button>
        </div>
      )}

      {warningMessage && (
        <div className="korekthor-warning-box">
          <svg
            className="korekthor-warning-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="14" />
            <circle cx="12" cy="19" r="0.5" fill="currentColor" />
          </svg>
          <span>{warningMessage}</span>
        </div>
      )}

      {sectionsToRender
        .filter((section) => section.mistakes.length > 0)
        .map((section) => {
          const count = section.mistakes.length;
          return (
            <div key={section.id} className="korekthor-part-section">
              <div className="korekthor-part-header">
                <span className="korekthor-part-title">{section.label}</span>
                <span className="korekthor-part-badge">
                  {`${count} ${getMistakeNoun(count)}`}
                </span>
              </div>

              <div className="korekthor-part-content">
                {section.mistakes.map((mistake, index) => (
                  <MistakeItem key={mistake.error?.id || index} mistake={mistake} index={index} />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MistakeList;
