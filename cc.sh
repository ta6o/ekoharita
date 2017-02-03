#! /bin/bash

[[ -s "/usr/local/rvm/scripts/rvm" ]] && . "/usr/local/rvm/scripts/rvm"
source /usr/local/rvm/scripts/rvm
rvm use 2.1.2@tesev

cd /var/www/cc
/usr/local/rvm/rubies/ruby-2.1.2/bin/ruby ./update.rb fetch

