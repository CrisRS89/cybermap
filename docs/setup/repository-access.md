# Repository access

## Objetivo

Documentar como clonar CyberMap segun el modo de distribucion del repositorio.

## Opcion A: repositorio publico

Si el repositorio es publico, cualquier usuario puede clonar con HTTPS:

    git clone https://github.com/CrisRS89/cybermap.git
    cd cybermap
    ./bin/cybermap install
    ./bin/cybermap dev

## Opcion B: repositorio privado

Si el repositorio es privado, no se debe usar usuario y contrasena.

GitHub requiere una de estas opciones:

- SSH key configurada en GitHub
- Personal Access Token
- GitHub CLI autenticado

### Clone privado recomendado por SSH

    git clone git@github.com:CrisRS89/cybermap.git
    cd cybermap
    ./bin/cybermap install
    ./bin/cybermap dev

## CLI local

CyberMap incluye CLI local versionado:

    ./bin/cybermap help
    ./bin/cybermap install
    ./bin/cybermap validate
    ./bin/cybermap test
    ./bin/cybermap dev

## CLI global opcional

En desarrollo local puede instalarse un symlink global:

    sudo ln -sf "$(pwd)/bin/cybermap" /usr/local/bin/cybermap

Luego puede usarse:

    cybermap help
    cybermap install
    cybermap validate
    cybermap dev

## Criterio de producto instalable

CyberMap se considera instalable por terceros cuando:

1. el usuario puede clonar el repo
2. `./bin/cybermap install` termina correctamente
3. `./bin/cybermap validate` pasa completo
4. `./bin/cybermap dev` levanta backend y frontend
5. la UI carga en `http://localhost:3000`
6. la API responde en `http://localhost:8000`
