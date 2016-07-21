#!/usr/bin/env bash

sh useTestConfig.sh
sudo -u www-data php setupTestEnvironment.php "jamaicanpsalms.scriptureforge.local"
if [ $# -eq 0 ]
    then
        node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js --baseUrl https://jamaicanpsalms.scriptureforge.local
    else
        node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js --baseUrl https://jamaicanpsalms.scriptureforge.local --specs "`find . -wholename "*scriptureforge*e2e*$1*.spec.js" -printf "%p,"|perl -p -e 's/,$//'`"
fi
sudo -u www-data php teardownTestEnvironment.php
sh useLiveConfig.sh
