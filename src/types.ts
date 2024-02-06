export interface Dictionary {
  id: string;
  name: string;
  description: string;
  categories: string[];
}

declare global {
  var ajaxurl: string;
  var korekthor_ajax: {
    nonce: string;
    plugin_url: string;
    dictionaries: Dictionary[];
    dictionaries_error: string;
    dictionaries_selected: string[];
  };
}
