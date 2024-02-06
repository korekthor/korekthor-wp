import React from "react";
import { Spinner } from "@wordpress/components";

const StatusLoading = () => {
  return (
    <div className="korekthor-loading">
      <Spinner />
      <p>Načítání oprav...</p>
    </div>
  );
};

export default StatusLoading;
