import React, { FC } from "react";

const StatusError: FC<{ error: string }> = ({ error }) => {
  return (
    <div className="korekthor-none">
      <p>
        Nepodařilo se načíst opravy. Detail chyby:
        <pre>{error}</pre>
      </p>
    </div>
  );
};

export default StatusError;
