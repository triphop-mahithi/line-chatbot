package main

import (
	"backend/config"
	"backend/database"
	"backend/handlers"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()
	client, err := database.ConnectToMongoDB(cfg.MongoURI)
	if err != nil {
		log.Fatal("MongoDB connection error", err)
	}
	db := client.Database(cfg.MongoDBName)

	// Gin setup
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081", "http://192.168.3.58:8081", "https://f4ddb5204500.ngrok-free.app"}, // ใส่ origin ของ frontend
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	api.GET("/categories", handlers.GetCategoriesHandler(db))
	api.GET("/packages", handlers.GetPackagesHandler(db))

	r.Run(":" + cfg.Port)
}
