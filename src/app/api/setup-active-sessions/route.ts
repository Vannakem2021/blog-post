import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Create active_sessions table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create active_sessions table for tracking live user presence
        CREATE TABLE IF NOT EXISTS public.active_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Create index for efficient queries
        CREATE INDEX IF NOT EXISTS idx_active_sessions_last_seen ON public.active_sessions(last_seen);
        CREATE INDEX IF NOT EXISTS idx_active_sessions_session_id ON public.active_sessions(session_id);

        -- Enable RLS
        ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow anonymous access for session tracking
        DROP POLICY IF EXISTS "Allow anonymous session tracking" ON public.active_sessions;
        CREATE POLICY "Allow anonymous session tracking" ON public.active_sessions
          FOR ALL USING (true);

        -- Create function to clean up old sessions automatically
        CREATE OR REPLACE FUNCTION cleanup_old_sessions()
        RETURNS void
        LANGUAGE plpgsql
        AS $$
        BEGIN
          DELETE FROM public.active_sessions 
          WHERE last_seen < NOW() - INTERVAL '5 minutes';
        END;
        $$;

        -- Create function to safely create the table (for fallback in app)
        CREATE OR REPLACE FUNCTION create_active_sessions_table_if_not_exists()
        RETURNS void
        LANGUAGE plpgsql
        AS $$
        BEGIN
          -- This function exists for app fallback, table is already created above
          RETURN;
        END;
        $$;

        -- Grant necessary permissions
        GRANT ALL ON public.active_sessions TO authenticated;
        GRANT ALL ON public.active_sessions TO anon;
        GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO authenticated;
        GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO anon;
        GRANT EXECUTE ON FUNCTION create_active_sessions_table_if_not_exists() TO authenticated;
        GRANT EXECUTE ON FUNCTION create_active_sessions_table_if_not_exists() TO anon;
      `
    });

    if (tableError) {
      console.error("Error creating active_sessions table:", tableError);
      return NextResponse.json(
        { error: "Failed to create active_sessions table", details: tableError },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Active sessions table created successfully" 
    });

  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to setup active sessions table",
    instructions: "Send a POST request to this endpoint to create the active_sessions table"
  });
}
