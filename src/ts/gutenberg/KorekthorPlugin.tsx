import { RichTextToolbarButton as _RichTextToolbarButton } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { PluginSidebar, PluginSidebarMoreMenuItem } from "@wordpress/edit-post";
import $ from "jquery";
import React from "react";
import KorekthorToolbarButton from "./ToolbarButton";
import { dispatch } from "@wordpress/data";
import KorekthorIcon from "./icon";
import StatusLoading from "./status/StatusLoading";
import StatusNone from "./status/StatusNone";
import DictionarySelect from "./dictionary/DictionarySelect";
import StatusError from "./status/StatusError";
import { ObjectElement, runHighlight } from "../../jakubuv-uzasny-highlighter";
import StatusOk from "./status/StatusOk";
import MistakeList from "./mistakes/MistakeList";

const RichTextToolbarButton = _RichTextToolbarButton as any;

export const KorekthorPlugin = () => {
  const [loading, setLoading] = React.useState(false);
  const [corrections, setCorrections] = React.useState<ObjectElement[] | null>(null);
  const [enabledDictionaries, setEnabledDictionaries] = React.useState([] as string[]);
  const [error, setError] = React.useState("");

  const selectedBlock = useSelect((select) => {
    const { getSelectedBlock } = select("core/block-editor") as any;
    return getSelectedBlock();
  }, []);

  const handleMistakeRerender = (corrections: ObjectElement[]) => {
    setLoading(false);
    setCorrections(corrections);
  };

  const handleCorrection = (text: string, element: Element) => {
    dispatch("core/edit-post").openGeneralSidebar("korekthor/korekthor-sidebar");

    setLoading(true);
    setError("");

    $.post(ajaxurl, {
      nonce: korekthor_ajax.nonce,
      action: "korekthor_correction",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",
      text: text,
      dictionaries: enabledDictionaries,
    }).done((data: any) => {
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setCorrections(data.data);

      // run highlighter
      runHighlight(element, data.data.data, handleMistakeRerender);
    });
  };

  const handleClick = () => {
    const query = `[data-block="${selectedBlock.clientId}"]`;

    const wpIframe = document.querySelector("iframe[name='editor-canvas']") as HTMLIFrameElement;

    let blockElement = wpIframe?.contentWindow.document.querySelector(query);

    if (!blockElement) {
      blockElement = document.querySelector(query);
    }

    if (!blockElement) {
      setError("Nepodařilo se najít blok. Napište nám prosím na info@korekthor.cz a my se vám pokusíme pomoci.");
      return;
    }

    const text = selectedBlock.attributes.content;

    handleCorrection(text, blockElement);
  };

  return (
    <>
      <PluginSidebarMoreMenuItem target="korekthor-sidebar" icon={<KorekthorIcon />}>
        Korekthor
      </PluginSidebarMoreMenuItem>
      <PluginSidebar name="korekthor-sidebar" title="Korekthor" className="korekthor-sidebar" icon={<KorekthorIcon />}>
        <div className="korekthor-sidebar-plugin">
          {loading ? (
            <StatusLoading />
          ) : corrections === null ? (
            <StatusNone />
          ) : error ? (
            <StatusError error={error} />
          ) : corrections.length > 0 ? (
            <MistakeList mistakes={corrections} />
          ) : (
            <StatusOk />
          )}
        </div>

        <DictionarySelect onDictionariesChange={setEnabledDictionaries} />
      </PluginSidebar>

      <KorekthorToolbarButton />

      <RichTextToolbarButton icon={<KorekthorIcon />} title="Opravit text" onClick={handleClick} />
    </>
  );
};

// // open korekthor sidebar on dom ready
// $(document).ready(() => {
//   dispatch("core/edit-post").openGeneralSidebar("korekthor/korekthor-sidebar");
// });
