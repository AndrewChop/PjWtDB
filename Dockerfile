# 1. Usa un'immagine base di Node.js (Node 16, perché è stabile e compatibile con il tuo progetto)
FROM node:18

# 2. Imposta una directory di lavoro nel container
WORKDIR /app

# 3. Copia i file necessari per installare le dipendenze (package.json e package-lock.json)
COPY package*.json ./
COPY prisma ./prisma
COPY public ./public
COPY src ./src

# 4. Installa le dipendenze del progetto
RUN npm install

# 5. Copia tutti i file del progetto nella directory di lavoro del container
COPY . .

# 6. Installa nodemon globalmente, poiché lo usi per avviare il progetto
RUN npm install -g nodemon

# 7. Genera il client Prisma
RUN npx prisma generate

# 8. Espone la porta su cui l'app sarà eseguita (porta 3000)
EXPOSE 3000

# 9. Comando di avvio per avviare il progetto con nodemon
CMD ["npx", "nodemon", "app.js"]