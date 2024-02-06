<div>
  <div id="korekthor-classic-main">
    Tady se budou dít veliké věci
  </div>

  <template id="korekthor-classic-idle">
    <div class="korekthor-classic-idle">
      <p>Není opraven žádný text, pro opravu klikněte na tlačítko "Zkontrolovat článek". To opraví celý obsah tohoto článku.</p>
      <p>
        <!-- For better experience -->
        Pro lepší zkušenost doporučujeme spíše používat blokový editor.
      </p>

      <button type="button" class="button button-primary button-large korekthor-button-fullwidth" id="korekthor-button-check">
        Zkontrolovat článek
      </button>

      <a href="#" class="thickbox korekthor-classic-link" id="korekthor-button-dictionaries">
        Otevřít výběr slovníků
      </a>
    </div>
  </template>

  <template id="korekthor-classic-running">
    <div class="korekthor-classic-running">
      <!-- add wordpress spinner -->
      <div class="spinner is-active">
        <div class="spinner-icon"></div>
      </div>

      <p>Probíhá kontrola článku...</p>
    </div>
  </template>

  <template id="korekthor-classic-dictionaries">
    <div class="korekthor-classic-dictionaries">
      <div class="korekthor-classic-dictionaries-header">
        <a href="#" class="thickbox korekthor-classic-link" id="korekthor-button-idle">
          Uložit a zavřít
        </a>

        <input type="text" class="large-text" id="korekthor-classic-dictionaries-search" placeholder="Hledat...">
      </div>

      <div id="korekthor-classic-dictionaries-list">

      </div>
    </div>
  </template>

  <template id="korekthor-classic-dictionary">
    <label class="korekthor-classic-dictionary-item">
      <div class="korekthor-classic-dictionary-item-header">
        <input type="checkbox" />

        <span class="korekthor-classic-dictionary-name"></span>
      </div>

      <div class="korekthor-classic-dictionary-item-categories"></div>

      <p></p>
    </label>
  </template>
  <template id="korekthor-classic-error">
    <div class="korekthor-classic-error">
      <p>Došlo k chybě při načítání slovníků. <br />Detail chyby:</p>

      <p>
      <pre id="korekthor-error-detail"></pre>
      </p>

      <a href="#" class="thickbox korekthor-classic-link" id="korekthor-button-idle">
        Zavřít
      </a>
    </div>
  </template>
  <template id="korekthor-classic-results">
    <div class="korekthor-classic-results">
      <h1>
        TODO: Do the magic
      </h1>
    </div>
  </template>
</div>