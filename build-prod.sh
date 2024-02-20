yarn build
cp -r src/* subversion/trunk
cp -r vendor/ subversion/trunk
cp readme.txt subversion/trunk

echo "Creating a zip file"
cd subversion
cp -r trunk/ korekthor
zip -vr korekthor.zip korekthor
rm -rf korekthor
mv korekthor.zip ../