import React from "react";

const StatusOk = () => {
  return (
    <div className="korekthor-text-ok">
      <img src={`${korekthor_ajax.plugin_url}/img/check.svg`} alt="" />
      <p>Text je v pořádku.</p>
    </div>
  );
};

export default StatusOk;
