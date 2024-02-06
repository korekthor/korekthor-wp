import React, { FC } from "react";

declare var korekthor_ajax: { nonce: string; plugin_url: string };
const StatusNone = () => {
  return (
    <div className="korekthor-none">
      <p>
        Pro zobrazení oprav vyberte blok a klikněte na tlačítko "Opravit text" v
        toolbaru.
      </p>

      <img src={`${korekthor_ajax.plugin_url}/img/tutorial.png`} alt="" />
    </div>
  );
};

export default StatusNone;
