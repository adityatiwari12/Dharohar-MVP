# Dharohar — EC2 Backend Deployment Guide

## For Antigravity IDE — AI Agent Reference

---

## What Is Already Done

- EC2 instance is launched and running
- Public IP: `15.207.107.254`
- Key file: `C:\Users\trive\Downloads\dharohar-key.pem`
- OS: Ubuntu 22.04 LTS
- Instance type: t2.micro

---

## Project Structure on Local Machine

```
D:\Dharohar\Dharohar-MVP\
├── frontend/        ← React + Vite (goes to Amplify)
├── server/          ← Express.js backend (goes to EC2)
├── SONIC/           ← AWS CDK + Lambda (already deployed)
└── docs/
```

Only the `server/` folder needs to be deployed to EC2.

---

## SSH Connection Command

All commands that run on EC2 use this pattern:

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "COMMAND HERE"
```

To open an interactive SSH session:

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254
```

---

## Step 1 — Install Node.js on EC2

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
```

Verify:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "node --version && npm --version"
```

Expected: `v20.x.x` and `10.x.x`

---

## Step 2 — Install Git and Clone Repository

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo apt install git -y && git clone https://github.com/YOUR_GITHUB_USERNAME/Dharohar-MVP.git"
```

Replace `YOUR_GITHUB_USERNAME` with the actual GitHub username.

Verify clone succeeded:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "ls ~/Dharohar-MVP"
```

---

## Step 3 — Install Dependencies

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "cd ~/Dharohar-MVP/server && npm install"
```

---

## Step 4 — Create .env File on EC2

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "cat > ~/Dharohar-MVP/server/.env << 'EOF'
PORT=3000
NODE_ENV=production
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXX
ASSETS_TABLE=dharohar-assets
CREATORS_TABLE=dharohar-creators
CONTRACTS_TABLE=dharohar-contracts
MEDIA_BUCKET=dharohar-media-641791054721
DOSSIERS_BUCKET=dharohar-dossiers-641791054721
API_GATEWAY_URL=https://YOUR_API_GATEWAY_ID.execute-api.ap-south-1.amazonaws.com/v1
EOF"
```

Replace all `YOUR_*` placeholders with actual values from the AWS CDK outputs.

---

## Step 5 — Install PM2 and Start Server

PM2 keeps the Express server running permanently — survives terminal close and EC2 reboots.

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo npm install -g pm2"
```

Start the server:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "cd ~/Dharohar-MVP/server && pm2 start npm --name dharohar-api -- start"
```

Enable auto-start on EC2 reboot:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "pm2 startup && pm2 save"
```

---

## Step 6 — Open Port 3000 in EC2 Security Group

In AWS Console:
```
EC2 → Instances → Select instance → Security tab
→ Click Security Group link
→ Inbound rules → Edit inbound rules → Add rule:
   Type: Custom TCP
   Port: 3000
   Source: 0.0.0.0/0
→ Save rules
```

---

## Step 7 — Verify Server is Running

Check PM2 status:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "pm2 list"
```

Expected output:
```
┌─────┬──────────────────┬─────────┬──────┬───────────┬──────────┐
│ id  │ name             │ mode    │ ↺    │ status    │ cpu      │
├─────┼──────────────────┼─────────┼──────┼───────────┼──────────┤
│ 0   │ dharohar-api     │ fork    │ 0    │ online    │ 0%       │
└─────┴──────────────────┴─────────┴──────┴───────────┴──────────┘
```

Status must be `online`. If it shows `errored` check Step 8.

Test the endpoint from your local machine:
```powershell
curl http://15.207.107.254:3000/health
```

Expected:
```json
{ "status": "healthy", "service": "dharohar-api" }
```

---

## Step 8 — Debugging if Server Fails to Start

Check logs:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "pm2 logs dharohar-api --lines 50"
```

Check what port is actually listening:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo netstat -tlnp"
```

Check if .env was created correctly:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "cat ~/Dharohar-MVP/server/.env"
```

Restart after fixing:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "pm2 restart dharohar-api"
```

---

## Step 9 — Deploy Code Updates

Every time code changes, run these to update EC2:

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "cd ~/Dharohar-MVP && git pull && cd server && npm install && pm2 restart dharohar-api"
```

---

## Step 10 — Set Up Nginx Reverse Proxy (Optional but Recommended)

Nginx proxies port 80 → port 3000 so URLs look like `http://15.207.107.254` instead of `http://15.207.107.254:3000`.

```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo apt install nginx -y"
```

Create Nginx config:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo bash -c 'cat > /etc/nginx/sites-available/dharohar << EOF
server {
    listen 80;
    server_name 15.207.107.254;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'"
```

Enable and start:
```powershell
ssh -i "C:\Users\trive\Downloads\dharohar-key.pem" ubuntu@15.207.107.254 "sudo ln -s /etc/nginx/sites-available/dharohar /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl restart nginx"
```

Open port 80 in EC2 Security Group (same as Step 6 but port 80).

Test:
```powershell
curl http://15.207.107.254/health
```

---

## Environment Variables Reference

| Variable | Where to Get It |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM → Users → dharohar-dev → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Same as above |
| `COGNITO_USER_POOL_ID` | CDK output: `UserPoolId` |
| `COGNITO_CLIENT_ID` | CDK output: `UserPoolClientId` |
| `ASSETS_TABLE` | `dharohar-assets` |
| `CREATORS_TABLE` | `dharohar-creators` |
| `CONTRACTS_TABLE` | `dharohar-contracts` |
| `MEDIA_BUCKET` | `dharohar-media-641791054721` |
| `DOSSIERS_BUCKET` | `dharohar-dossiers-641791054721` |
| `API_GATEWAY_URL` | CDK output: `ApiUrl` |

---

## EC2 Management Commands

| Action | Command |
|---|---|
| Check server status | `pm2 list` |
| View logs | `pm2 logs dharohar-api --lines 50` |
| Restart server | `pm2 restart dharohar-api` |
| Stop server | `pm2 stop dharohar-api` |
| Pull latest code | `git pull` then `pm2 restart dharohar-api` |
| Check port usage | `sudo netstat -tlnp` |
| Check disk space | `df -h` |

All commands above must be run inside an SSH session on the EC2 instance.

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Connection refused on port 3000` | Server not running or port not open | Check `pm2 list`, open port in Security Group |
| `pm2 status: errored` | App crashed on start | Run `pm2 logs` to see the error |
| `Cannot find module` | `npm install` not run | Run `npm install` in `server/` folder |
| `Missing env variable` | `.env` file not created | Re-run Step 4 |
| `EACCES permission denied` | Port below 1024 without sudo | Use port 3000+ or use Nginx on port 80 |
| `git pull` has conflicts | Local changes on EC2 | Run `git reset --hard HEAD && git pull` |

---

## Final URLs After Deployment

```
Backend API:  http://15.207.107.254:3000
              or http://15.207.107.254 (if Nginx is set up)

Health check: http://15.207.107.254:3000/health
```

These URLs go into the frontend `.env` as `VITE_API_URL`.

---

*Dharohar — Team MLOps 4.0 — AWS Hackathon 2026*
