package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"product-service/internal/consul"
	"product-service/internal/db"
	"product-service/internal/handlers"
	"product-service/internal/metrics"
)

func main() {
	db.Connect()

	r := chi.NewRouter()
	r.Use(metrics.Middleware)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "product-service"})
	})

	r.Handle("/metrics", promhttp.Handler())

	r.Post("/", handlers.CreateProduct)
	r.Get("/", handlers.ListProducts)
	r.Get("/{id}", handlers.GetProduct)
	r.Patch("/{id}/stock", handlers.UpdateStock)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-stop
		consul.Deregister()
		os.Exit(0)
	}()

	go consul.Register(port)

	log.Printf("product-service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
