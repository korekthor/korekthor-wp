import { Button } from "@wordpress/components";
import React from "react";
import KorekthorIcon from "./icon";

interface KorekthorToolbarButtonProps {
  onClick?: () => void;
}

const KorekthorToolbarButton: React.FC<KorekthorToolbarButtonProps> = ({ onClick }) => {
  return (
    <Button
      icon={<KorekthorIcon />}
      label="Zkontrolovat článek"
      onClick={onClick}
    />
  );
};

export default KorekthorToolbarButton;
