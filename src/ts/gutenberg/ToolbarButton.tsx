import { BlockControls, useBlockProps } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton, Button } from "@wordpress/components";

import React from "react";
import KorekthorIcon from "./icon";

const KorekthorToolbarButton = () => {
  return (
    // <div {...useBlockProps()}>
    //   <BlockControls>
    //     <ToolbarGroup>
    <Button
      icon={<KorekthorIcon />}
      label="Edit"
      onClick={() => alert("Editing")}
    />
    //     </ToolbarGroup>
    //   </BlockControls>
    // </div>
  );
};

// registerFormatType("my-custom-format/sample-output", {
//   title: "Opravit text",
//   tagName: "totojemujtag",
//   className: null,
//   edit: KorekthorToolbarButton,
// });

export default KorekthorToolbarButton;
