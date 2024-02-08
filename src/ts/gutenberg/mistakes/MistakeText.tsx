import React, { FC } from "react";
import { MistakeError } from "./MistakeItem";

interface MistakeTextProps {
  mistake: MistakeError;
}

const MistakeText: FC<MistakeTextProps> = ({ mistake }) => {
  if (!mistake) return null;

  if (mistake.error.find((error) => error === "NEZNAME_SLOVO"))
    return (
      <>
        <img src={`${korekthor_ajax.plugin_url}/img/slash.svg`} alt="Slash icon" />
        <span className="korekthor-mistake-suggestion">Neznámé slovo</span>
      </>
    );
  else if (mistake.error.length === 1 && mistake.error[0] === "PRILIS_DLOUHE") {
    return (
      <>
        <img src={`${korekthor_ajax.plugin_url}/img/alert-triangle.svg`} alt="Alert triangle icon" />
        <span className="korekthor-mistake-suggestion">Tohle se nám nepovedlo zpracovat...</span>
      </>
    );
  } else {
    return (
      <>
        <span className="korekthor-mistake-original">{mistake.token}</span>
        <img src={`${korekthor_ajax.plugin_url}/img/arrow-right.svg`} alt="Arrow right icon" />
        <span className="korekthor-mistake-suggestion">{mistake.result}</span>
      </>
    );
  }
};

export default MistakeText;
