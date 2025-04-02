
# Guia de Configuração do AR Cool Manager com Supabase

Este documento fornece instruções detalhadas sobre como configurar o AR Cool Manager com o Supabase como backend. Siga estas etapas para configurar o banco de dados, autenticação e outras funcionalidades necessárias.

## 1. Criando um Projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login ou crie uma conta.
2. Clique em "New Project" e selecione uma organização (ou crie uma nova).
3. Dê um nome ao seu projeto, escolha uma senha forte para o banco de dados e selecione uma região próxima aos seus usuários.
4. Aguarde a criação do projeto (pode levar alguns minutos).

## 2. Configurando Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

Substitua `sua_url_do_supabase` e `sua_chave_anon_do_supabase` pelos valores encontrados no painel do Supabase em: Configurações do Projeto > API.

## 3. Executando Migrações

### 3.1 Instalação da CLI do Supabase

```bash
# Instalar a CLI do Supabase
npm install -g supabase

# Login na CLI
supabase login

# Vincular projeto existente
supabase link --project-ref [REF_DO_PROJETO]
```

### 3.2 Executando Migrações

As migrações estão localizadas no diretório `supabase/migrations`. Para aplicá-las:

```bash
supabase db push
```

## 4. Estrutura do Banco de Dados

Nossa aplicação utiliza as seguintes tabelas principais:

### 4.1 Tabelas do Sistema

- `user_roles`: Armazena os papéis dos usuários (admin, regular)
- `company_settings`: Configurações da empresa
- `api_support`: Dados de API de suporte
- `system_logs`: Logs do sistema
- `language_preferences`: Preferências de idioma dos usuários

### 4.2 Tabelas de Negócio

- `clients`: Cadastro de clientes
- `collaborators`: Cadastro de colaboradores
- `services`: Registro de serviços realizados
- `service_items`: Itens utilizados em cada serviço
- `products`: Cadastro de produtos
- `stock_categories`: Categorias de estoque
- `stock_subcategories`: Subcategorias de estoque
- `stock_items`: Itens em estoque
- `categories`: Categorias gerais (para produtos e serviços)
- `financial_entries`: Registro de entradas financeiras
- `message_templates`: Templates de mensagens
- `scheduled_messages`: Mensagens agendadas
- `message_logs`: Registro de mensagens enviadas

### 4.3 Tabelas SAAS

- `saas_companies`: Empresas registradas no SAAS
- `saas_plans`: Planos de assinatura
- `saas_subscriptions`: Assinaturas ativas
- `saas_payment_logs`: Registro de pagamentos
- `saas_webhooks`: Configurações de webhooks

## 5. Migrations (SQL)

A seguir estão as migrações necessárias para criar a estrutura do banco de dados:

### 5.1 Estrutura Inicial

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- Tabela de papéis de usuários
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'regular')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações da empresa
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de API de suporte
CREATE TABLE IF NOT EXISTS api_support (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  support_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  document TEXT,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências de idioma
CREATE TABLE IF NOT EXISTS language_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.2 Tabelas de Negócio

```sql
-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  formal_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  district TEXT,
  city TEXT,
  notes TEXT,
  send_maintenance BOOLEAN DEFAULT FALSE,
  send_welcome BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de colaboradores
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias de estoque
CREATE TABLE IF NOT EXISTS stock_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subcategorias de estoque
CREATE TABLE IF NOT EXISTS stock_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES stock_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collaborator_id UUID REFERENCES collaborators(id) ON DELETE SET NULL,
  notes TEXT,
  total_value DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de serviço
CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES stock_subcategories(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entradas financeiras
CREATE TABLE IF NOT EXISTS financial_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  value DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('welcome', 'maintenance')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de fidelização
CREATE TABLE IF NOT EXISTS loyalty_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_interval INT NOT NULL DEFAULT 180, -- Dias
  maintenance_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  welcome_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  maintenance_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens agendadas
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de mensagens enviadas
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('welcome', 'maintenance', 'test')),
  message_content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de permissões de usuários
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource, action)
);

-- Tabela de manual do sistema
CREATE TABLE IF NOT EXISTS system_manual (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.3 Tabelas SAAS

```sql
-- Tabela de empresas SAAS
CREATE TABLE IF NOT EXISTS saas_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos SAAS
CREATE TABLE IF NOT EXISTS saas_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL,
  quarterly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2) NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas SAAS
CREATE TABLE IF NOT EXISTS saas_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES saas_plans(id) ON DELETE RESTRICT,
  payment_cycle TEXT NOT NULL CHECK (payment_cycle IN ('monthly', 'quarterly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'suspended', 'trial')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de pagamentos SAAS
CREATE TABLE IF NOT EXISTS saas_payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES saas_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('successful', 'failed', 'pending', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de webhooks SAAS
CREATE TABLE IF NOT EXISTS saas_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5.4 Políticas de Segurança (RLS)

```sql
-- Habilitar RLS para todas as tabelas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_manual ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_webhooks ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar papel de usuário
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas gerais (exemplo)
CREATE POLICY "Admins podem fazer tudo" ON user_roles 
  USING (is_admin()) 
  WITH CHECK (is_admin());

CREATE POLICY "Usuários veem suas próprias permissões" ON user_roles
  USING (user_id = auth.uid());

-- Políticas para tabelas principais (exemplos)
CREATE POLICY "Todos os usuários podem ver clientes" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Todos os usuários podem criar clientes" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos os usuários podem atualizar clientes" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Apenas admins podem excluir clientes" ON clients
  FOR DELETE USING (is_admin());

-- Políticas para produtos
CREATE POLICY "Todos os usuários podem ver produtos" ON products
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem criar produtos" ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Todos podem atualizar preços" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Apenas admins podem excluir produtos" ON products
  FOR DELETE USING (is_admin());

-- Adicione políticas semelhantes para as outras tabelas
```

### 5.5 Dados Iniciais (Seed)

```sql
-- Criar usuário admin inicial (usando a função de autenticação do Supabase)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data)
VALUES (
  uuid_generate_v4(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}'::jsonb
);

-- Configurar o usuário como admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com';

-- Configurações iniciais da empresa
INSERT INTO company_settings (name, timezone)
VALUES ('AR Cool Manager', 'America/Sao_Paulo');

-- ID de Suporte
INSERT INTO api_support (support_id, user_name, api_key)
VALUES (
  substring(md5(random()::text) from 1 for 9),
  'Administrador',
  gen_random_uuid()::text
);

-- Categorias iniciais
INSERT INTO categories (name, type)
VALUES 
  ('Instalação', 'service'),
  ('Manutenção Preventiva', 'service'),
  ('Manutenção Corretiva', 'service'),
  ('Limpeza', 'service'),
  ('Split', 'product'),
  ('Cassete', 'product'),
  ('Janela', 'product'),
  ('Portátil', 'product');

-- Templates de mensagens iniciais
INSERT INTO message_templates (type, content)
VALUES 
  ('welcome', 'Olá {Nome_formal}, bem-vindo! Agradecemos pela preferência. Estamos à disposição para qualquer assistência relacionada ao seu equipamento de ar-condicionado.'),
  ('maintenance', 'Olá {Nome_formal}, já se passaram {dias_desde_ultimo_servico} dias desde o último serviço. Recomendamos agendar uma manutenção preventiva para garantir o funcionamento ideal do seu equipamento. Entre em contato conosco.');

-- Configurações de fidelização iniciais
INSERT INTO loyalty_settings (maintenance_interval, maintenance_price, welcome_template_id, maintenance_template_id)
SELECT 180, 250.00, 
  (SELECT id FROM message_templates WHERE type = 'welcome' LIMIT 1),
  (SELECT id FROM message_templates WHERE type = 'maintenance' LIMIT 1);

-- Manual do sistema
INSERT INTO system_manual (section, title, content)
VALUES
  ('geral', 'Introdução', 'Bem-vindo ao AR Cool Manager, um sistema completo para gestão de empresas de refrigeração e manutenção de ar-condicionado...'),
  ('clientes', 'Cadastro de Clientes', 'Para cadastrar um novo cliente, acesse o menu Clientes e clique em Adicionar Cliente...'),
  ('serviços', 'Registro de Serviços', 'Para registrar um novo serviço, acesse o menu Serviços e clique em Adicionar Serviço...');
```

## 6. Funções do Supabase

### 6.1 Função para Agendar Mensagens de Manutenção

```sql
CREATE OR REPLACE FUNCTION schedule_maintenance_messages()
RETURNS void AS $$
DECLARE
  client_rec RECORD;
  last_service_date DATE;
  maintenance_interval INT;
  template_id UUID;
BEGIN
  -- Obter o intervalo de manutenção e template
  SELECT ls.maintenance_interval, ls.maintenance_template_id 
  INTO maintenance_interval, template_id
  FROM loyalty_settings ls 
  LIMIT 1;
  
  -- Processar cada cliente com flag de manutenção ativa
  FOR client_rec IN 
    SELECT c.id, c.full_name 
    FROM clients c 
    WHERE c.send_maintenance = TRUE
  LOOP
    -- Encontrar a data do último serviço
    SELECT MAX(s.date) INTO last_service_date
    FROM services s
    WHERE s.client_id = client_rec.id;
    
    -- Se houver um último serviço e estiver próximo do intervalo de manutenção
    IF last_service_date IS NOT NULL AND 
       (CURRENT_DATE - last_service_date) >= (maintenance_interval - 7) AND
       NOT EXISTS (
         SELECT 1 FROM scheduled_messages sm 
         WHERE sm.client_id = client_rec.id 
         AND sm.status = 'pending'
       )
    THEN
      -- Agendar mensagem de manutenção
      INSERT INTO scheduled_messages (
        client_id, template_id, scheduled_date, status
      ) VALUES (
        client_rec.id, 
        template_id, 
        last_service_date + maintenance_interval, 
        'pending'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Gatilho (Trigger) para Registrar Logs do Sistema

```sql
CREATE OR REPLACE FUNCTION log_system_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  details_json JSONB;
BEGIN
  -- Determinar a ação realizada
  IF TG_OP = 'INSERT' THEN
    action_text := 'Criação de ' || TG_TABLE_NAME;
    details_json := jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'insert', 'new_data', row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'Atualização de ' || TG_TABLE_NAME;
    details_json := jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'update', 'old_data', row_to_json(OLD), 'new_data', row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'Exclusão de ' || TG_TABLE_NAME;
    details_json := jsonb_build_object('table', TG_TABLE_NAME, 'operation', 'delete', 'old_data', row_to_json(OLD));
  END IF;
  
  -- Registrar o log
  INSERT INTO system_logs (user_id, action, details)
  VALUES (auth.uid(), action_text, details_json);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger a tabelas relevantes
CREATE TRIGGER log_clients_changes
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION log_system_activity();

CREATE TRIGGER log_services_changes
AFTER INSERT OR UPDATE OR DELETE ON services
FOR EACH ROW EXECUTE FUNCTION log_system_activity();

-- Repita para outras tabelas importantes
```

## 7. Configuração de Autenticação

1. No painel do Supabase, acesse "Authentication" > "Providers" e configure:
   - Email Auth: Habilite
   - Site URL: URL do seu aplicativo
   - Redirecionar URLs: adicione URLs de redirecionamento válidas

2. Configure e-mails personalizados:
   - Authentication > Email Templates
   - Personalize os templates de Confirmação, Redefinição de Senha e Convite

## 8. Configuração de Storage

1. No painel do Supabase, acesse "Storage" e crie buckets:
   - `company-logos`: para logos das empresas
   - `user-uploads`: para uploads gerais de usuários

2. Configure políticas de acesso:
   - Permita que usuários autenticados leiam de todos os buckets
   - Permita que admins escrevam em todos os buckets
   - Permita que usuários regulares escrevam apenas em áreas específicas

## 9. Conclusão

Após seguir todas as etapas acima, seu AR Cool Manager estará corretamente integrado com o Supabase como backend. O sistema está configurado para suportar autenticação, armazenamento de dados, permissões de usuários e todas as funcionalidades necessárias.

Para quaisquer problemas ou dúvidas, consulte a [documentação oficial do Supabase](https://supabase.com/docs) ou entre em contato com o suporte.
