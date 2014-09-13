cd ..
grunt build
cd deploy
rm -rf vegewro
cp -r ../dist/ vegewro/
cd vegewro
mv index.html index.php
git add --all :/
read -p "Enter commit/deployment message: " message
git commit -m message
git push

 
