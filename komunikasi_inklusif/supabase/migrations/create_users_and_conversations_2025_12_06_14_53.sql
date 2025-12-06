-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users profile table
CREATE TABLE public.user_profiles_2025_12_06_14_53 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    disability_type TEXT CHECK (disability_type IN ('deaf', 'blind', 'both', 'none')),
    accessibility_preferences JSONB DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE public.conversations_2025_12_06_14_53 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    type TEXT CHECK (type IN ('direct', 'group', 'community')) DEFAULT 'direct',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants
CREATE TABLE public.conversation_participants_2025_12_06_14_53 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations_2025_12_06_14_53(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages_2025_12_06_14_53 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations_2025_12_06_14_53(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'voice', 'sign_language', 'image', 'video')) DEFAULT 'text',
    media_url TEXT,
    ai_processed_data JSONB DEFAULT '{}', -- Store AI translations, descriptions, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles_2025_12_06_14_53
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_2025_12_06_14_53
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_2025_12_06_14_53
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view conversations they participate in" ON public.conversations_2025_12_06_14_53
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants_2025_12_06_14_53 
            WHERE conversation_id = conversations_2025_12_06_14_53.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants_2025_12_06_14_53
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.conversation_participants_2025_12_06_14_53 cp2
            WHERE cp2.conversation_id = conversation_participants_2025_12_06_14_53.conversation_id 
            AND cp2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view messages in their conversations" ON public.messages_2025_12_06_14_53
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants_2025_12_06_14_53 
            WHERE conversation_id = messages_2025_12_06_14_53.conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages_2025_12_06_14_53
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants_2025_12_06_14_53 
            WHERE conversation_id = messages_2025_12_06_14_53.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- Enable RLS on all tables
ALTER TABLE public.user_profiles_2025_12_06_14_53 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations_2025_12_06_14_53 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants_2025_12_06_14_53 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_12_06_14_53 ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles_2025_12_06_14_53(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants_2025_12_06_14_53(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants_2025_12_06_14_53(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages_2025_12_06_14_53(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages_2025_12_06_14_53(created_at DESC);