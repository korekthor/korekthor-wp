import React from "react";
import { Dictionary } from "../../../types";

interface DictionaryRecordProps {
  dictionary: Dictionary;
  onChange: (newState: boolean) => void;
  enabled: boolean;
}

const DictionaryRecord: React.FC<DictionaryRecordProps> = ({ dictionary, onChange, enabled }) => {
  return (
    <label key={dictionary.id} className="korekthor-dictionary-item" htmlFor={"korekthor-" + dictionary.id}>
      <div className="korekthor-dictionary-item-header">
        <input
          type="checkbox"
          checked={enabled}
          id={"korekthor-" + dictionary.id}
          onChange={() => onChange(!enabled)}
        />

        <span>{dictionary.name}</span>
      </div>

      {dictionary.categories.length > 0 && (
        <div className="korekthor-dictionary-item-categories">{dictionary.categories.join(", ")}</div>
      )}

      <p>{dictionary.description}</p>
    </label>
  );
};

export default DictionaryRecord;
