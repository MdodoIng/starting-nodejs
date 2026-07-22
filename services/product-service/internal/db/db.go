package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect() {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var pool *pgxpool.Pool
	var err error

	// Retry loop — same reasoning as the Node service: Postgres may not be
	// ready the instant this container starts.
	for attempt := 1; attempt <= 10; attempt++ {
		pool, err = pgxpool.New(context.Background(), connStr)
		if err == nil {
			if pingErr := pool.Ping(context.Background()); pingErr == nil {
				break
			}
		}
		log.Printf("database not ready yet (attempt %d/10), retrying in 2s...", attempt)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	Pool = pool

	_, err = Pool.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			name VARCHAR(200) NOT NULL,
			description TEXT,
			price NUMERIC(10,2) NOT NULL,
			category VARCHAR(100),
			stock INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT now()
		);
	`)
	if err != nil {
		log.Fatalf("failed to create schema: %v", err)
	}
	log.Println("connected to database and schema ready")
}
