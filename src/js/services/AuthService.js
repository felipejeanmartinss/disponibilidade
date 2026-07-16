import {
    SupabaseClientService,
} from "./SupabaseClientService.js";

export class AuthService {
    constructor() {
        this.client =
            SupabaseClientService.getClient();
    }

    async getSession() {
        const { data, error } =
            await this.client.auth.getSession();

        if (error) {
            throw error;
        }

        return data.session;
    }

    async signInWithPassword({
        email,
        password,
    }) {
        const { data, error } =
            await this.client.auth.signInWithPassword({
                email:
                    String(email).trim(),
                password,
            });

        if (error) {
            throw error;
        }

        return data;
    }

    async signOut() {
        const { error } =
            await this.client.auth.signOut({
                scope: "local",
            });

        if (error) {
            throw error;
        }
    }

    static createUserProfile(session) {
        const user = session?.user;

        if (!user) {
            return null;
        }

        const metadata =
            user.user_metadata ?? {};

        const email =
            String(user.email ?? "").trim();

        const displayName =
            String(
                (
                    metadata.full_name ??
                    metadata.name ??
                    email.split("@")[0]
                ) || "Usuário"
            ).trim();

        return {
            id: user.id,
            email,
            displayName,
            initials:
                AuthService.createInitials(
                    displayName
                ),
        };
    }

    static createInitials(name) {
        const words = String(name ?? "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!words.length) {
            return "US";
        }

        const selectedWords =
            words.length === 1
                ? [words[0]]
                : [
                      words[0],
                      words[words.length - 1],
                  ];

        return selectedWords
            .map((word) => word[0])
            .join("")
            .toUpperCase();
    }

}
