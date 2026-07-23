package consul

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
)

const serviceID = "product-service-1"

func consulURL() string {
	url := os.Getenv("CONSUL_URL")
	if url == "" {
		url = "http://consul:8500"
	}
	return url
}

func Register(port string) {
	portInt, err := strconv.Atoi(port)
	if err != nil {
		log.Printf("invalid port %q, cannot register with Consul: %v", port, err)
		return
	}

	payload := map[string]interface{}{
		"ID":      serviceID,
		"Name":    "product-service",
		"Address": "product-service",
		"Port":    portInt,
		"Check": map[string]string{
			"HTTP":     fmt.Sprintf("http://product-service:%s/health", port),
			"Interval": "10s",
		},
	}

	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPut, consulURL()+"/v1/agent/service/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, reqErr := http.DefaultClient.Do(req)
	if reqErr != nil {
		log.Printf("could not register with Consul (continuing anyway): %v", reqErr)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Printf("Consul registration failed with status %d", resp.StatusCode)
		return
	}
	log.Println("registered with Consul as product-service")
}

func Deregister() {
	req, _ := http.NewRequest(http.MethodPut, consulURL()+"/v1/agent/service/deregister/"+serviceID, nil)
	http.DefaultClient.Do(req)
}
