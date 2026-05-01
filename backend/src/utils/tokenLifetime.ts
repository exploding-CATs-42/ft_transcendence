import ms, { type StringValue } from "ms";

function getEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not set`);
    }

    return value.trim();
}

export function getRefreshTokenLifetimeMs(): number {
    const value = ms(getEnv("JWT_REFRESH_EXPIRES_IN") as StringValue);

    if (typeof value !== "number") {
        throw new Error("JWT_REFRESH_EXPIRES_IN must be a valid duration");
    }

    return value;
}