# 云笔记项目部署指南

## 🚀 云服务器部署步骤

### 1. 准备云服务器

**推荐配置：**
- **CPU**: 2核心以上
- **内存**: 4GB以上 
- **存储**: 20GB以上
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

**推荐云服务商：**
- 阿里云ECS
- 腾讯云CVM  
- 华为云ECS
- AWS EC2
- 数字海洋 (DigitalOcean)

### 2. 服务器初始化

连接到服务器后，执行以下命令：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git vim unzip

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录以应用Docker组权限
sudo reboot
```

### 3. 上传项目文件

**方式一：使用Git（推荐）**
```bash
# 在服务器上克隆项目
git clone <your-repo-url> cloud-notes
cd cloud-notes
```

**方式二：使用FTP/SCP上传**
```bash
# 在服务器上创建项目目录
mkdir -p /opt/cloud-notes
cd /opt/cloud-notes

# 使用WinSCP、FileZilla或命令上传以下文件：
# - 整个项目代码
# - Dockerfile
# - docker-compose.yml
# - nginx.conf
# - .env.production
```

### 4. 配置环境变量

```bash
# 复制并编辑生产环境配置
cp .env.example .env.production
vim .env.production
```

在 `.env.production` 中配置：
```env
# Supabase 配置（必须）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key

# 应用配置
NODE_ENV=production
PORT=4000
```

### 5. 配置Nginx（修改域名）

编辑 `nginx.conf`，将 `your-domain.com` 替换为您的实际域名：

```bash
vim nginx.conf
# 将所有 your-domain.com 替换为您的域名
```

### 6. 执行部署

**使用部署脚本（推荐）：**
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

**手动部署：**
```bash
# 构建并启动服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 7. 配置防火墙

```bash
# 开放必要端口
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

## 🌐 域名和SSL配置

### 1. 域名解析

在域名提供商处添加A记录：
```
类型: A
名称: @（或www）
值: 您的服务器IP地址
TTL: 600
```

### 2. SSL证书配置

**使用Let's Encrypt（免费）：**
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 停止nginx容器
docker-compose stop nginx

# 生成证书
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 将证书复制到项目目录
sudo mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
sudo chown -R $USER:$USER ./ssl

# 重新启动服务
docker-compose up -d
```

### 3. 自动续期SSL证书

```bash
# 添加定时任务
sudo crontab -e

# 添加以下行（每月1号2点自动续期）
0 2 1 * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

## 📊 运维管理

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f cloud-notes

# 重启服务
docker-compose restart

# 更新应用
git pull
docker-compose up -d --build

# 备份数据（如果有本地存储）
docker-compose exec cloud-notes npm run backup

# 查看资源使用
docker stats
```

### 监控和日志

```bash
# 设置日志轮转
sudo vim /etc/logrotate.d/docker-compose

# 内容如下：
/opt/cloud-notes/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

## 🔧 故障排除

### 常见问题

**1. 服务启动失败**
```bash
# 查看详细日志
docker-compose logs cloud-notes

# 检查端口占用
sudo netstat -tlnp | grep :4000
```

**2. 数据库连接失败**
- 检查Supabase URL和API密钥是否正确
- 确认Supabase项目状态正常

**3. 域名访问失败**
```bash
# 检查DNS解析
nslookup your-domain.com

# 检查Nginx配置
docker-compose exec nginx nginx -t
```

**4. SSL证书问题**
```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew
```

## 🔐 安全建议

1. **定期更新系统和依赖**
2. **使用强密码和SSH密钥认证**
3. **定期备份数据库**
4. **监控服务器资源使用情况**
5. **设置告警通知**

## 📞 技术支持

如遇到部署问题，请检查：
1. 服务器配置是否满足要求
2. 网络连接是否正常
3. 环境变量是否配置正确
4. Supabase服务是否正常