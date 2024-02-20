import React from "react";
import { ObjectElement } from "../../../jakubuv-uzasny-highlighter";
import MistakeItem from "./MistakeItem";
import { Button } from "@wordpress/components";

interface MistakeListProps {
  mistakes: ObjectElement[];
  acceptAll: () => void;
  rejectAll: () => void;
}

const MistakeList: React.FC<MistakeListProps> = ({ mistakes, acceptAll, rejectAll }) => {
  return (
    <div className="korekthor-mistake-list">
      <div className="korekthor-buttons">
        <Button isPrimary onClick={acceptAll}>
          Přijmout všechny návrhy
        </Button>
        <Button isSecondary onClick={rejectAll}>
          Odmítnout všechny návrhy
        </Button>
      </div>

      {mistakes.map((mistake, index) => (
        <MistakeItem key={index} mistake={mistake} index={index} />
      ))}
    </div>
  );
};

export default MistakeList;
