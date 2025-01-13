FROM node:18
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY public ./public
COPY src ./src
RUN npm install
COPY . .
RUN npm install -g nodemon
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx nodemon app.js"]