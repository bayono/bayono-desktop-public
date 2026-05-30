
if [ -d "release" ]; then
  echo "Removing existing release folder..."
  rm -rf release
fi

echo "Copying files..."
cp -r ../bayono-desktop/deployment/release .

