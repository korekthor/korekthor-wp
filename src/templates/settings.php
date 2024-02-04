<div class="wrap">
  <h1>Nastavení integrace korekthoru</h1>

  <?php settings_errors(); ?>

  <form action="options.php" method="POST">
    <?php
    settings_fields("korekthor_options_group");
    do_settings_sections("korekthor_api");
    submit_button();
    ?>
  </form>
</div>