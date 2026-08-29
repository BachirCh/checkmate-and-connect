# Rollback: restore checkmate.ma to the old static Worker

Account: 11a97cad91bc72800eac712c07af4ace (Epiquizfr@gmail.com's Account)
Zone:    5f196e99510fae45c27bfe9afb52d697 (checkmate.ma)

Bindings BEFORE cutover (both pointed at `checkmate-website`):
  checkmate.ma      binding id 8ba7efb4860e0978b864c36d3bcaaa93a368d9d8
  www.checkmate.ma  binding id 0054233b8b8191a103fedda1d95fa14d05a34638

To roll back, from ~/Documents/Code/checkmate-website:
  npx wrangler deploy      # re-claims both custom domains for checkmate-website

The old Worker script is NOT deleted by the cutover, so this is fast.
