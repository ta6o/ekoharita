#! /bin/bash

ls ../public/stylesheets/*/*.less | entr ./concat_assets.sh &
ls ../views/index.haml | entr ./update_html.sh

