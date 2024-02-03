<?php
/*
  * @package korekthor
  */

class KorekthorDeactivate
{
  public static function deactivate()
  {
    flush_rewrite_rules();
  }
}
