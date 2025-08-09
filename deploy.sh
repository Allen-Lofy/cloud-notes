#!/bin/bash

# 云笔记项目部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署云笔记项目..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必要的工具
check_requirements() {
    echo "📋 检查部署环境..."
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 环境检查通过${NC}"
}

# 检查环境变量文件
check_env() {
    echo "🔧 检查环境变量配置..."
    
    if [ ! -f .env.production ]; then
        echo -e "${RED}❌ .env.production 文件不存在${NC}"
        echo "请复制 .env.production.example 并填入正确的配置"
        exit 1
    fi
    
    # 检查关键环境变量是否已配置
    if grep -q "your-project-url" .env.production; then
        echo -e "${YELLOW}⚠️  请修改 .env.production 中的 Supabase 配置${NC}"
        echo "请将 your-project-url 和 your-anon-key 替换为实际值"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 环境变量检查通过${NC}"
}

# 构建和启动服务
deploy() {
    echo "🏗️  构建 Docker 镜像..."
    docker-compose build --no-cache
    
    echo "🚀 启动服务..."
    docker-compose up -d
    
    echo "⏳ 等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✅ 部署成功！${NC}"
        echo "📱 应用访问地址："
        echo "   - HTTP: http://localhost:4000"
        echo "   - 带 Nginx: http://localhost"
        echo ""
        echo "📊 查看服务状态: docker-compose ps"
        echo "📝 查看日志: docker-compose logs -f"
        echo "🛑 停止服务: docker-compose down"
    else
        echo -e "${RED}❌ 部署失败，请检查日志${NC}"
        docker-compose logs
        exit 1
    fi
}

# 主函数
main() {
    echo "🌟 云笔记项目自动部署脚本"
    echo "================================"
    
    check_requirements
    check_env
    deploy
    
    echo ""
    echo "🎉 部署完成！"
    echo "💡 提示：首次部署可能需要等待几分钟来下载依赖"
}

# 如果有参数 --help 或 -h，显示帮助
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "云笔记项目部署脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh                 # 部署应用"
    echo "  ./deploy.sh --help         # 显示帮助"
    echo ""
    echo "部署前请确保："
    echo "1. 已安装 Docker 和 Docker Compose"
    echo "2. 已配置 .env.production 文件"
    echo "3. 已在 Supabase 中创建项目并获取 API 密钥"
    exit 0
fi

# 运行主函数
main