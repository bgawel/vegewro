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
read -p "Enter commit/deployment message: " message
git commit -m message
git push
