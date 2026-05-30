-- Financial Assistant Database Schema
-- Tables for financial research, accounts, transactions, and documents

-- Financial Research Notes Table
-- Stores research notes, links, analysis on companies, markets, regulations
CREATE TABLE IF NOT EXISTS financial_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Research metadata
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('company', 'market', 'regulation', 'strategy', 'tax', 'investment', 'other')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Content
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- Example structure:
  -- {
  --   "summary": "Brief summary",
  --   "key_points": ["point 1", "point 2"],
  --   "sources": [{"url": "...", "title": "...", "date": "..."}],
  --   "analysis": "Detailed analysis text",
  --   "attachments": ["document_id_1", "document_id_2"]
  -- }
  
  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Accounts Table
-- Track bank accounts, investment accounts, credit cards, etc.
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Account details
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment', 'retirement', 'credit_card', 'loan', 'other')),
  institution TEXT,
  account_number_last4 TEXT,
  
  -- Balances
  current_balance DECIMAL(15, 2),
  available_balance DECIMAL(15, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  -- Example: {"interest_rate": 2.5, "credit_limit": 10000, "minimum_payment": 250}
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Transactions Table
-- Track expenses, income, investments, transfers
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Transaction details
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Categorization
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'investment', 'dividend', 'interest', 'fee', 'other')),
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Additional context
  merchant TEXT,
  notes TEXT,
  reference_number TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  -- Example: {"tax_deductible": true, "business_expense": false, "receipt_url": "..."}
  
  -- Status
  status TEXT DEFAULT 'posted' CHECK (status IN ('pending', 'posted', 'cleared', 'voided')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Documents Table
-- Track uploaded financial documents (statements, reports, receipts)
CREATE TABLE IF NOT EXISTS financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Document details
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('statement', 'receipt', 'invoice', 'tax_document', 'report', 'contract', 'other')),
  
  -- File storage (Supabase Storage bucket path)
  storage_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- Document metadata
  document_date DATE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Extracted data (from OCR/parsing)
  extracted_data JSONB DEFAULT '{}'::JSONB,
  
  -- Associated entities
  account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
  transaction_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Financial Research RLS
ALTER TABLE financial_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own research"
  ON financial_research FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research"
  ON financial_research FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research"
  ON financial_research FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research"
  ON financial_research FOR DELETE
  USING (auth.uid() = user_id);

-- Financial Accounts RLS
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON financial_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON financial_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON financial_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON financial_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Financial Transactions RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON financial_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON financial_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON financial_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON financial_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Financial Documents RLS
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON financial_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON financial_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON financial_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON financial_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_financial_research_user_id ON financial_research(user_id);
CREATE INDEX idx_financial_research_conversation_id ON financial_research(conversation_id);
CREATE INDEX idx_financial_research_category ON financial_research(category);
CREATE INDEX idx_financial_research_created_at ON financial_research(created_at DESC);

CREATE INDEX idx_financial_accounts_user_id ON financial_accounts(user_id);
CREATE INDEX idx_financial_accounts_account_type ON financial_accounts(account_type);
CREATE INDEX idx_financial_accounts_is_active ON financial_accounts(is_active);

CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_account_id ON financial_transactions(account_id);
CREATE INDEX idx_financial_transactions_conversation_id ON financial_transactions(conversation_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category);

CREATE INDEX idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX idx_financial_documents_conversation_id ON financial_documents(conversation_id);
CREATE INDEX idx_financial_documents_account_id ON financial_documents(account_id);
CREATE INDEX idx_financial_documents_type ON financial_documents(document_type);
CREATE INDEX idx_financial_documents_created_at ON financial_documents(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_research_updated_at
  BEFORE UPDATE ON financial_research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_documents_updated_at
  BEFORE UPDATE ON financial_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();