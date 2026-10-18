import React from "react";
import { Button } from "@wordpress/components";

declare var korekthor_ajax: { nonce: string; plugin_url: string };

interface StatusOkProps {
  onRecheck?: () => void;
}

const StatusOk: React.FC<StatusOkProps> = ({ onRecheck }) => {
  return (
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
  );
};

export default StatusOk;
