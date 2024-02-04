import { PluginSidebar, PluginSidebarMoreMenuItem } from "@wordpress/edit-post";
import { ToolbarButton } from "@wordpress/components";
import React, { useState, useEffect } from "react";
import KorekthorIcon from "./icon";
import {
  RichTextToolbarButton as _RichTextToolbarButton,
  useBlockProps,
} from "@wordpress/block-editor";
import KorekthorToolbarButton from "./ToolbarButton";
import { useSelect } from "@wordpress/data";
import $ from "jquery";

const RichTextToolbarButton = _RichTextToolbarButton as any;

declare const ajaxurl: string;
declare const korekthor_ajax: {
  nonce: string;
};

export const KorekthorPlugin = () => {
  const selectedBlock = useSelect((select) => {
    const { getSelectedBlock } = select("core/block-editor") as any;
    return getSelectedBlock();
  }, []);

  const handleCorrection = (text: string) => {
    $.post(ajaxurl, {
      nonce: korekthor_ajax.nonce,
      action: "korekthor_correction",
      text: text,
    }).done((data: any) => {
      console.log(data);
    });
  };

  const handleClick = () => {
    const query = `[data-block="${selectedBlock.clientId}"]`;

    const wpIframe = document.querySelector(
      "iframe[name='editor-canvas']"
    ) as HTMLIFrameElement;

    const blockElement = wpIframe.contentWindow.document.querySelector(query);
    const text = selectedBlock.attributes.content;
    console.log(blockElement, text, query);

    handleCorrection(text);
  };

  return (
    <>
      <PluginSidebarMoreMenuItem
        target="korekthor-sidebar"
        icon={<KorekthorIcon />}
      >
        Korekthor
      </PluginSidebarMoreMenuItem>
      <PluginSidebar
        name="korekthor-sidebar"
        title="Korekthor"
        icon={<KorekthorIcon />}
      >
        Content of the sidebar
      </PluginSidebar>

      <KorekthorToolbarButton />

      <RichTextToolbarButton
        icon={<KorekthorIcon />}
        title="Opravit text"
        onClick={handleClick}
      />
    </>
  );
};
