cd ..
grunt build
cd deploy
rm -rf devphp/*
rm -rf devphp/.htaccess
cp -r ../dist/* devphp/
cp -r ../dist/.htaccess devphp/
cd devphp
mv index.html index.php
git add --all :/
git commit -am 'go'
git push
