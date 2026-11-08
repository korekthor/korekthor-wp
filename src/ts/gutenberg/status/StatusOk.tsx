import React from "react";
import { Button } from "@wordpress/components";

declare var korekthor_ajax: { nonce: string; plugin_url: string };

interface StatusOkProps {
  onRecheck?: () => void;
  warningMessage?: string | null;
}

const StatusOk: React.FC<StatusOkProps> = ({ onRecheck, warningMessage }) => {
  return (
    <>
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
      <div className="korekthor-text-ok">
        <img src={`${korekthor_ajax.plugin_url}/img/check.svg`} alt="" />
        <p>Všechny části (titulek, perex i text) jsou v pořádku.</p>
        {onRecheck && (
          <div style={{ marginTop: "1rem" }}>
            <Button variant="secondary" onClick={onRecheck}>
              Zkontrolovat znovu
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default StatusOk;
