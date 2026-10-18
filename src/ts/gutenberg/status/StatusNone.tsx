import React from "react";
import { Button } from "@wordpress/components";

declare var korekthor_ajax: { nonce: string; plugin_url: string };

interface StatusNoneProps {
  onCheck?: () => void;
}

const StatusNone: React.FC<StatusNoneProps> = ({ onCheck }) => {
  return (
    <div className="korekthor-none">
      {onCheck && (
        <div style={{ marginBottom: "1rem" }}>
          <Button isPrimary onClick={onCheck} style={{ width: "100%", justifyContent: "center" }}>
            Zkontrolovat celý příspěvek
          </Button>
        </div>
      )}

      <p>
        Pro zobrazení oprav klikněte na tlačítko výše nebo vyberte blok a klikněte na "Opravit text" v toolbaru. Zkontroluje se titulek, perex i text článku.
      </p>

      <img src={`${korekthor_ajax.plugin_url}/img/tutorial.png`} alt="" />
    </div>
  );
};

export default StatusNone;
