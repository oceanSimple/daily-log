package config

import "os"

type Config struct {
	AppEnv      string
	Port        string
	DatabaseURL string
	CORSOrigin  string
	SeedOnBoot  bool
}

func Load() Config {
	cfg := Config{
		AppEnv:     getEnv("APP_ENV", "development"),
		Port:       getEnv("PORT", "8080"),
		CORSOrigin: getEnv("CORS_ORIGIN", "*"),
		SeedOnBoot: getEnv("SEED_ON_BOOT", "true") == "true",
	}

	cfg.DatabaseURL = databaseURL()
	return cfg
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func databaseURL() string {
	if value := os.Getenv("DATABASE_URL"); value != "" {
		return value
	}

	host := getEnv("DB_HOST", "127.0.0.1")
	port := getEnv("DB_PORT", "5432")
	name := getEnv("DB_NAME", "daily_log")
	user := getEnv("DB_USER", "daily_log")
	password := getEnv("DB_PASSWORD", "daily_log")
	sslMode := getEnv("DB_SSLMODE", "disable")

	return "postgres://" + user + ":" + password + "@" + host + ":" + port + "/" + name + "?sslmode=" + sslMode
}
