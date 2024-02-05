import React from "react";
import { Button } from "@wordpress/components";
import { useEffect } from "react";
import { TextControl } from "@wordpress/components";
import DictionaryRecord from "./DictionaryRecord";

export interface Dictionary {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

declare var korekthor_ajax: {
  dictionaries: Dictionary[];
  dictionaries_error: string;
};

interface DictionarySelectProps {
  onDictionariesChange: (dictionaries: string[]) => void;
}

const DictionarySelect: React.FC<DictionarySelectProps> = ({
  onDictionariesChange,
}) => {
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
  const [states, setStates] = React.useState<{
    [id: string]: boolean;
  }>({
    ...korekthor_ajax.dictionaries.reduce(
      (acc, dictionary) => ({ ...acc, [dictionary.id]: false }),
      {}
    ),
  });

  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);
  const MAX_HEIGHT = Infinity;

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
    const enabledDictionaries = Object.entries(states)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id);

    onDictionariesChange(enabledDictionaries);
  }, [states, onDictionariesChange]);

  // filtering dictionaries
  const filteredDictionaries = korekthor_ajax.dictionaries.filter(
    (dictionary) => {
      if (search === "") {
        return true;
      }

      const searchLower = search.toLowerCase();
      return (
        dictionary.name.toLowerCase().includes(searchLower) ||
        dictionary.description.toLowerCase().includes(searchLower) ||
        dictionary.categories.some((category) =>
          category.toLowerCase().includes(searchLower)
        )
      );
    }
  );

  return (
    <div className="korekthor-dictionary">
      <div className="korekthor-dictionary-header">
        <Button
          variant="link"
          onClick={() => setDictionariesOpened(!dictionariesOpened)}
        >
          {dictionariesOpened ? "Skrýt slovníky" : "Zobrazit slovníky"}
        </Button>

        {dictionariesOpened && <Button variant="link">Uložit</Button>}
      </div>

      <div
        className="korekthor-dictionary-content-wrapper"
        style={{ maxHeight: height }}
      >
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
              onChange={(newState) =>
                setStates({ ...states, [dictionary.id]: newState })
              }
              enabled={states[dictionary.id]}
            />
          ))}
          {filteredDictionaries.length === 0 && (
            <p className="korekthor-dictionary-error">
              Nebyly nalezeny žádné slovníky. Zkuste změnit hledaný výraz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DictionarySelect;
