package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"product-service/internal/db"
	"product-service/internal/handlers"
)

func main() {
	db.Connect()

	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "product-service"})
	})

	r.Post("/", handlers.CreateProduct)
	r.Get("/", handlers.ListProducts)
	r.Get("/{id}", handlers.GetProduct)
	r.Patch("/{id}/stock", handlers.UpdateStock)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Printf("product-service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
