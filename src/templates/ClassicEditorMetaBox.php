<div>
  <div id="korekthor-classic-main">
    Tady se budou dít veliké věci
  </div>

  <template id="korekthor-classic-idle">
    <div class="korekthor-classic-idle">
      <p>Není opraven žádný text, pro opravu klikněte na tlačítko "Zkontrolovat článek". To opraví celý obsah tohoto článku.</p>
      <button type="button" class="button button-primary button-large" id="korekthor-check-button">
        Zkontrolovat článek
      </button>
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
</div>