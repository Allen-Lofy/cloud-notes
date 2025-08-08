const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取 Supabase 配置
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误：缺少 Supabase 环境变量');
  console.log('需要设置：');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  try {
    console.log('测试数据库连接...');
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ 表 "profiles" 不存在');
        console.log('需要执行数据库初始化脚本: scripts/init-db.sql');
        return false;
      } else {
        console.error('❌ 数据库连接错误:', error.message);
        return false;
      }
    }
    
    console.log('✅ 数据库连接成功');
    console.log('✅ profiles 表存在');
    
    // 检查其他关键表
    const tables = ['folders', 'files', 'shares', 'likes', 'comments'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (tableError && tableError.code === '42P01') {
        console.log(`❌ 表 "${table}" 不存在`);
        return false;
      } else if (tableError) {
        console.log(`⚠️  表 "${table}" 连接错误:`, tableError.message);
      } else {
        console.log(`✅ 表 "${table}" 存在`);
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    return false;
  }
}

// 运行测试
testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 所有数据库表都已正确创建！');
  } else {
    console.log('\n❌ 请在 Supabase 控制台执行 scripts/init-db.sql 脚本');
  }
});