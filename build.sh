node index.js && 
rm -f Archive.zip &&
zip -qr Archive.zip *.js node_modules/ &&
echo "Build Complete"
