<?php
/*
  * @package korekthor
  */

class KorekthorActivate
{
  public static function activate()
  {
    flush_rewrite_rules();
  }
}
