# 🚀 Como Rodar o MenteLeve com Docker

## O que você vai precisar
- Uma VM com Ubuntu no Azure (ou qualquer servidor Linux)
- As portas **8080**, **8081** e **9000** liberadas no firewall da VM
- O arquivo `menteleve-docker-final.zip`

---

## Passo 1 — Instalar o Docker na VM

Conecte na VM via SSH e rode os comandos abaixo:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

Verifique se funcionou:
```bash
docker --version
docker compose version
```

---

## Passo 2 — Transferir os arquivos para a VM

No **seu computador Windows**, abra o terminal e rode:

```bash
# Primeiro crie a pasta na VM
ssh seu-usuario@IP-DA-VM "mkdir -p ~/menteleve"

# Depois envie os arquivos (ajuste o caminho do zip)
scp -r C:\caminho\para\menteleve-final seu-usuario@IP-DA-VM:~/menteleve/
```

> Substitua `seu-usuario` e `IP-DA-VM` pelos dados da sua VM.

---

## Passo 3 — Subir os contêineres

De volta ao terminal SSH da VM:

```bash
cd ~/menteleve/menteleve-final
docker compose up -d --build
```

Aguarde o build terminar (pode demorar uns 2 minutos na primeira vez).

---

## Passo 4 — Criar as tabelas do banco

```bash
docker compose exec menteleve-app npx prisma migrate dev --name init
```

---

## Passo 5 — Acessar tudo no navegador

| Serviço   | URL                          |
|-----------|------------------------------|
| Sistema   | http://IP-DA-VM:8080         |
| Adminer   | http://IP-DA-VM:8081         |
| Portainer | http://IP-DA-VM:9000         |

---

## Senhas e credenciais

**Portainer** (primeira vez — crie um usuário):
- Usuário: `admin`
- Senha: mínimo 12 caracteres (ex: `Menteleve@2026`)

**Adminer** (acesso ao banco):
- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Usuário: `menteleve_user`
- Senha: `menteleve_pass`
- Base de dados: `menteleve`

---

## Para ligar/desligar depois

**Subir:**
```bash
cd ~/menteleve/menteleve-final && docker compose up -d
```

**Parar:**
```bash
docker compose down
```

> Não precisa rodar o `migrate` de novo — o banco já foi criado e os dados ficam salvos mesmo após desligar.
