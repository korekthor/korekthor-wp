import React from "react";
import { ObjectElement } from "../../../jakubuv-uzasny-highlighter";
import MistakeItem from "./MistakeItem";

interface MistakeListProps {
  mistakes: ObjectElement[];
}

const MistakeList: React.FC<MistakeListProps> = ({ mistakes }) => {
  return (
    <div className="korekthor-mistake-list">
      {mistakes.map((mistake, index) => (
        <MistakeItem key={index} mistake={mistake} index={index} />
      ))}
    </div>
  );
};

export default MistakeList;
