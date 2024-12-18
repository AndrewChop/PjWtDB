# Definisci le variabili necessarie
PROJECT_DIR=$(shell pwd)

# Target principale: installa tutto e configura il progetto
install: install-deps setup-prisma setup-env prisma-migrate build

# Installa le dipendenze
install-deps:
	@echo "Installazione delle dipendenze..."
	npm install
	npm install --save-dev typescript ts-node @types/node prisma nodemon

# Configura Prisma
setup-prisma:
	@echo "Configurazione di Prisma..."
	npx prisma init
	npx prisma generate

# Configura le variabili d'ambiente
setup-env:
	@echo "Configurazione delle variabili d'ambiente..."
	@if [ ! -f .env ]; then \
	  echo "SERVER_HOST=\"localhost\"" > .env; \
	  echo "SERVER_PORT=\"3000"" >> .env; \
	  echo "JWT_SECRET=\"DFkjmqDb5oBWiJvYnAMNQ0gHfF5iuU6oiXz+3ei/o979YUPfzSIdkt8bDzucqVJKq9d3Z27rrY/mtsappg+fKg==\"" > .env; \
	  echo "DATABASE_URL=\"postgres://projectdb_advb_user:8tNIpuv80wKXeL0TpkI7I5tBxM7zcgxY@dpg-cme168ed3nmc73do2hb0-a.frankfurt-postgres.render.com:5432/projectdb_advb\"" >> .env; \
	else \
	  echo ".env già presente, saltato"; \
	fi

# Esegui le migrazioni del database
prisma-migrate:
	@echo "Applicazione delle migrazioni di Prisma..."
	npx prisma migrate deploy

# Build del progetto TypeScript
build:
	@echo "Compilazione del progetto TypeScript..."
	tsc

# Avvia il server
start:
	@echo "Avvio del server..."
	nodemon app.js

# Pulizia dei file compilati
clean:
	@echo "Pulizia dei file compilati..."
	rm -rf dist
	rm -rf node_modules

# Target per ricostruire tutto
rebuild: clean install
