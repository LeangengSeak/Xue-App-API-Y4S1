FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./ 

COPY tsconfig.json ./

RUN npm install --include=dev

COPY . ./

RUN npm run build

EXPOSE 4001
CMD ["node", "dist/index.js"]
