import React from "react";
import { ObjectElement } from "../../../jakubuv-uzasny-highlighter";
import MistakeText from "./MistakeText";

interface MistakeItemProps {
  mistake: ObjectElement;
  index: number;
}

export interface MistakeError {
  error: string[];
  id: string;
  index: number;
  result: string;
  token: string;
}

const MistakeItem: React.FC<MistakeItemProps> = ({ mistake }) => {
  const error = mistake.error as MistakeError;

  return (
    <div className="korekthor-mistake">
      <div className="korekthor-mistake-info">
        <div className="korekthor-mistake-summary">
          <MistakeText mistake={error} />
        </div>

        <div className="korekthor-mistake-details">
          {error.error.map((e: string) => korekthor_ajax.error_codes[e]).join(",")}
        </div>
      </div>

      <div className="korekthor-mistake-actions">
        <button onClick={() => mistake.accept()} className="korekthor-button-accept">
          <img src={`${korekthor_ajax.plugin_url}/img/check.svg`} alt="Check icon" />
        </button>

        <button onClick={() => mistake.reject()} className="korekthor-button-reject">
          <img src={`${korekthor_ajax.plugin_url}/img/x.svg`} alt="X icon" />
        </button>
      </div>
    </div>
  );
};

export default MistakeItem;
