import { RichTextToolbarButton as _RichTextToolbarButton } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { PluginSidebar, PluginSidebarMoreMenuItem } from "@wordpress/edit-post";
import $ from "jquery";
import React from "react";
import KorekthorToolbarButton from "./ToolbarButton";
import { dispatch } from "@wordpress/data";
import KorekthorIcon from "./icon";
import { Spinner } from "@wordpress/components";
import StatusLoading from "./StatusLoading";
import StatusNone from "./StatusNone";

const RichTextToolbarButton = _RichTextToolbarButton as any;

declare var ajaxurl: string;
declare var korekthor_ajax: { nonce: string; plugin_url: string };

export const KorekthorPlugin = () => {
  const [loading, setLoading] = React.useState(false);
  const [corrections, setCorrections] = React.useState([] as any[]);

  const selectedBlock = useSelect((select) => {
    const { getSelectedBlock } = select("core/block-editor") as any;
    return getSelectedBlock();
  }, []);

  const handleCorrection = (text: string, element: Element) => {
    dispatch("core/edit-post").openGeneralSidebar(
      "korekthor/korekthor-sidebar"
    );

    setLoading(true);

    $.post(ajaxurl, {
      nonce: korekthor_ajax.nonce,
      action: "korekthor_correction",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",
      text: text,
    }).done((data: any) => {
      console.log(text, data, element);
    });
  };

  const handleClick = () => {
    const query = `[data-block="${selectedBlock.clientId}"]`;

    const wpIframe = document.querySelector(
      "iframe[name='editor-canvas']"
    ) as HTMLIFrameElement;

    const blockElement = wpIframe.contentWindow.document.querySelector(query);
    const text = selectedBlock.attributes.content;

    handleCorrection(text, blockElement);
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
        <div className="korekthor-sidebar">
          {loading ? (
            <StatusLoading />
          ) : corrections.length == 0 ? (
            <StatusNone />
          ) : (
            <p>Korekce: TODO</p>
          )}
        </div>
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
