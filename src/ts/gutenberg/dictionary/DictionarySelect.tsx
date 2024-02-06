import React from "react";
import { Button } from "@wordpress/components";
import { useEffect } from "react";
import { TextControl } from "@wordpress/components";
import DictionaryRecord from "./DictionaryRecord";
import $ from "jquery";
import { Dictionary } from "../../../types";

interface DictionarySelectProps {
  onDictionariesChange: (dictionaries: string[]) => void;
}

const DictionarySelect: React.FC<DictionarySelectProps> = ({ onDictionariesChange }) => {
  // add company dictionary
  const companyDictionary: Dictionary = {
    id: "company",
    name: "Firemní slovník",
    description: "Slovník vaší firmy.",
    categories: [],
  };

  if (!korekthor_ajax.dictionaries.find((d) => d.id === "company")) {
    korekthor_ajax.dictionaries.unshift(companyDictionary);
  }

  const [dictionariesOpened, setDictionariesOpened] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>(korekthor_ajax.dictionaries_selected || []);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);
  const MAX_HEIGHT = Infinity;
  const [updated, setUpdated] = React.useState(false);

  useEffect(() => {
    if (dictionariesOpened) {
      const content = contentRef.current;
      if (content) {
        const contentHeight = content.getBoundingClientRect().height;
        setHeight(Math.min(contentHeight, MAX_HEIGHT));
      }
    } else {
      setHeight(0);
    }
  }, [dictionariesOpened, contentRef]);

  useEffect(() => {
    onDictionariesChange(selected);
  }, [selected, onDictionariesChange]);

  const handleUpdateDictionaries = () => {
    $.post(ajaxurl, {
      nonce: korekthor_ajax.nonce,
      action: "korekthor_update_dictionaries",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",
      dictionaries: selected,
    }).done((data: any) => {
      setUpdated(true);
    });
  };

  useEffect(() => {
    if (updated) {
      const timeout = setTimeout(() => {
        setUpdated(false);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [updated]);

  // filtering dictionaries
  const filteredDictionaries = korekthor_ajax.dictionaries.filter((dictionary) => {
    if (search === "") {
      return true;
    }

    const searchLower = search.toLowerCase();
    return (
      dictionary.name.toLowerCase().includes(searchLower) ||
      dictionary.description.toLowerCase().includes(searchLower) ||
      dictionary.categories.some((category) => category.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="korekthor-dictionary">
      <div className="korekthor-dictionary-header">
        <Button variant="link" onClick={() => setDictionariesOpened(!dictionariesOpened)}>
          {dictionariesOpened ? "Skrýt slovníky" : "Zobrazit slovníky"}
        </Button>

        {dictionariesOpened && (
          <Button onClick={handleUpdateDictionaries} variant="link">
            {updated ? "Uloženo!" : "Uložit"}
          </Button>
        )}
      </div>

      <div className="korekthor-dictionary-content-wrapper" style={{ maxHeight: height }}>
        <div className="korekthor-dictionary-content" ref={contentRef}>
          <TextControl
            className="korekthor-dictionary-search"
            value={search}
            onChange={setSearch}
            style={{ margin: 0 }}
            placeholder="Hledat..."
          />
          {filteredDictionaries.map((dictionary) => (
            <DictionaryRecord
              key={dictionary.id}
              dictionary={dictionary}
              onChange={(state) => {
                setSelected((prev) => (state ? [...prev, dictionary.id] : prev.filter((id) => id !== dictionary.id)));
              }}
              enabled={selected.includes(dictionary.id)}
            />
          ))}
          {filteredDictionaries.length === 0 && (
            <p className="korekthor-dictionary-error">Nebyly nalezeny žádné slovníky. Zkuste změnit hledaný výraz.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionarySelect;
