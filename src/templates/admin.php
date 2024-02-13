<div class="wrap">
  <h1>
    Korekthor pro WordPress
  </h1>

  <ul class="nav nav-tabs">
    <li class="active">
      <a href="#korekthor-dashboard">
        Přehled
      </a>
    </li>
    <!-- <li>
      <a href="#updates">
        Aktualizace
      </a>
    </li> -->

    <li>
      <a href="#about">
        O projektu
      </a>
    </li>
  </ul>

  <div class="tab-content">
    <div id="korekthor-dashboard" class="tab-pane fade in active">
      <h3>
        Přehled
      </h3>
      <div>
        <? if (!$api_key_is_set) { ?>
          <div>
            <h4>
              API klíč není nastaven.
            </h4>
            <p>
              Pro získání API klíče přejďete do administrace firmy <a href="https://korekthor.cz/firma" target="_blank">zde</a> a vytvořte nový API klíč.
            </p>
            <p>
              Po vytvoření API klíče přejděte do <a href="<?= admin_url("admin.php?page=korekthor_settings") ?>">nastavení</a> a vložte ho do pole "API klíč".
            </p>
          </div>
        <? } else if (isset($data["error"])) { ?>
          <div>
            <h4>
              Nepodařilo se načíst data o firmě.
            </h4>
            <p>
              <?= $data["error"] ?>
            </p>
            <p>
              Zkontrolujte prosím, zda je váš API klíč správně nastaven.
              Můžete ho zkontrolovat v <a href="<?= admin_url("admin.php?page=korekthor_settings") ?>">nastavení</a>.
            </p>
          </div>
        <? } else { ?>
          <div>
            <h4>
              Přihlášeno k firmě
            </h4>

            <div class="korekthor-company">
              <div><?= $company["name"] ?></div>
              Vytvořeno: <?= date("d. m. Y", strtotime($company["createdAt"])) ?> <br />
              Jméno API klíče: <?= $company["apiKey"] ?>
            </div>
            <p>
              Pro správu firmy přejděte do <a href="https://korekthor.cz/firma" target="_blank">administrace firmy</a>.
            </p>
          </div>
        <? } ?>
      </div>
    </div>

    <!-- <div id="updates" class="tab-pane fade">
      <h3>
        Aktualizace
      </h3>
      <p>
        Tady budou aktualizace
      </p>
    </div> -->

    <div id="about" class="tab-pane fade">
      <h3>
        O projektu
      </h3>
      <p>
        Tady bude popis projektu
      </p>
    </div>
  </div>
</div>