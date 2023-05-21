rimraf dist

export NODE_ENV=production

rimraf dist

tsc -p ./tsconfig.build.json --pretty

# cp -R src/public dist/src/public

cp -R .env dist/

cp -R server/Connector/assets/ dist/Connector/assets/

cp package.json dist/