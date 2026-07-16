import {
    SUPABASE_CONFIG,
} from "../config/supabase.js";

export class SupabaseClientService {
    static client = null;

    static isConfigured() {
        return Boolean(
            SUPABASE_CONFIG.url &&
            SUPABASE_CONFIG.publishableKey
        );
    }

    static getClient() {
        if (SupabaseClientService.client) {
            return SupabaseClientService.client;
        }

        if (!SupabaseClientService.isConfigured()) {
            throw new Error("A conexão com o Supabase ainda não foi configurada.");
        }

        const supabaseLibrary = globalThis.supabase;

        if (typeof supabaseLibrary?.createClient !== "function") {
            throw new Error("Não foi possível carregar a biblioteca do Supabase.");
        }

        SupabaseClientService.client = supabaseLibrary.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.publishableKey,
            {
                db: {
                    schema: SUPABASE_CONFIG.schema,
                },
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                },
            }
        );

        return SupabaseClientService.client;
    }

    static async checkConnection() {
        const client = SupabaseClientService.getClient();
        const { error } = await client
            .from("projects")
            .select("id", {
                count: "exact",
                head: true,
            });

        if (error) {
            throw new Error(
                `Não foi possível acessar o schema Supabase: ${error.message}`
            );
        }

        return true;
    }
}
