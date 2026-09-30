package router

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/izagoto/zk-paillier-donation-system/internal/auth"
	"github.com/izagoto/zk-paillier-donation-system/internal/campaign"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/donation"
)

func Setup(
	db *pgxpool.Pool,
	jwtSecret string,
	paillierPublicKey *paillier.PublicKey,
) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Authentication
	userRepository := auth.NewUserRepository(db)
	authService := auth.NewService(userRepository)

	jwtManager := auth.NewJWTManager(
		jwtSecret,
		24*time.Hour,
	)

	authHandler := auth.NewHandler(
		authService,
		jwtManager,
	)

	api := r.Group("/api")
	{
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)

			protected := authRoutes.Group("")
			protected.Use(auth.AuthMiddleware(jwtManager))
			{
				protected.GET("/me", authHandler.Me)
			}
		}
	}

	// Campaign
	campaignRepository := campaign.NewRepository(db)
	campaignService := campaign.NewService(campaignRepository)
	campaignHandler := campaign.NewHandler(campaignService)

	campaignRoutes := api.Group("/campaigns")
	{
		campaignRoutes.GET("", campaignHandler.FindAll)
		campaignRoutes.GET("/:id", campaignHandler.FindByID)

		protectedCampaignRoutes := campaignRoutes.Group("")
		protectedCampaignRoutes.Use(auth.AuthMiddleware(jwtManager))
		{
			protectedCampaignRoutes.POST("", campaignHandler.Create)
		}
	}

	// Donation
	donationRepository := donation.NewRepository(db)
	donationService := donation.NewService(
		donationRepository,
		campaignRepository,
		paillierPublicKey,
	)

	donationHandler := donation.NewHandler(donationService)
	donationRoutes := api.Group("/donations")
	{
		protectedDonationRoutes := donationRoutes.Group("")
		protectedDonationRoutes.Use(auth.AuthMiddleware(jwtManager))
		{
			protectedDonationRoutes.POST("", donationHandler.Create)
			protectedDonationRoutes.POST("/:id/confirm", donationHandler.Confirm)
		}
	}
	
	return r
}
