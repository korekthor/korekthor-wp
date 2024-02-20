<div>
  <div id="korekthor-classic-main">
    Tady se budou dít veliké věci
  </div>

  <template id="korekthor-classic-idle">
    <div class="korekthor-classic-idle">
      <p>Není opraven žádný text, pro opravu klikněte na tlačítko "Zkontrolovat článek". To opraví celý obsah tohoto článku.</p>

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

      <div id="korekthor-classic-dictionaries-error">

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
      <p>Došlo k chybě při opravování textu. <br />Detail chyby:</p>

      <p>
      <pre id="korekthor-error-detail"></pre>
      </p>

      <a href="#" class="thickbox korekthor-classic-link" id="korekthor-button-idle">
        Zavřít
      </a>
    </div>
  </template>

  <template id="korekthor-classic-ok">
    <div class="korekthor-text-ok">
      <img src="
            <?php echo $plugin_url . "img/check.svg"; ?>
          " alt="">
      <p>Text je v pořádku.</p>
      <a href="#" class="thickbox korekthor-classic-link" id="korekthor-button-idle">
        Zavřít
      </a>
    </div>
  </template>

  <template id="korekthor-classic-results">
    <div class="korekthor-classic-results korekthor-classic">
      <div class="korekthor-mistake-list" id="korekthor-mistake-list">
        Načítání...
      </div>
    </div>
  </template>

  <template id="korekthor-classic-mistake">
    <div class="korekthor-mistake">
      <div class="korekthor-mistake-info">
        <div class="korekthor-mistake-summary">
          <img style="display: none;" class="korekthor-icon-slash" src="<?php echo $plugin_url . "img/slash.svg"; ?>" alt="Check icon" />
          <img style="display: none;" class="korekthor-icon-alert" src="<?php echo $plugin_url . "img/alert-triangle.svg"; ?>" alt="Check icon" />

          <span style="display: none;" class="korekthor-mistake-original"></span>
          <img style="display: none;" class="korekthor-icon-arrow" src="<?php echo $plugin_url . "img/arrow-right.svg"; ?>" alt="Check icon" />
          <span class="korekthor-mistake-suggestion"></span>

        </div>

        <div class="korekthor-mistake-details">
        </div>
      </div>

      <div class="korekthor-mistake-actions">
        <button class="korekthor-button-accept" type="button">
          <img src="<?php echo $plugin_url . "img/check.svg"; ?>" alt="Check icon" />
        </button>

        <button class="korekthor-button-reject" type="button">
          <img src="<?php echo $plugin_url . "img/x.svg"; ?>" alt="X icon" />
        </button>
      </div>
    </div>
  </template>
</div>