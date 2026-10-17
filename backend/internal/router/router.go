package router

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/izagoto/zk-paillier-donation-system/internal/auth"
	"github.com/izagoto/zk-paillier-donation-system/internal/health"
	"github.com/izagoto/zk-paillier-donation-system/internal/blockchain"
	"github.com/izagoto/zk-paillier-donation-system/internal/campaign"
	"github.com/izagoto/zk-paillier-donation-system/internal/crypto/paillier"
	"github.com/izagoto/zk-paillier-donation-system/internal/donation"
	"github.com/izagoto/zk-paillier-donation-system/internal/middleware"
	"github.com/izagoto/zk-paillier-donation-system/internal/zk"
)

func Setup(
	db *pgxpool.Pool,
	jwtSecret string,
	bootstrapToken string,
	loginMaxAttempts int,
	loginWindow time.Duration,
	paillierPublicKey *paillier.PublicKey,
	paillierPrivateKey *paillier.PrivateKey,
	zkVerifier *zk.Verifier,
	zkProver *zk.Prover,
	blockchainRegistry *blockchain.Registry,
	blockchainSigner *blockchain.Signer,
) (*gin.Engine, *donation.Service) {
	r := gin.Default()
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORS())
	r.Use(middleware.RequestLog())

	healthHandler := health.NewHandler(db)
	r.GET("/health", healthHandler.Live)
	r.GET("/health/ready", healthHandler.Ready)

	userRepository := auth.NewUserRepository(db)
	authService := auth.NewService(userRepository)

	jwtManager := auth.NewJWTManager(
		jwtSecret,
		24*time.Hour,
	)

	loginLimiter := auth.NewLoginRateLimiter(loginMaxAttempts, loginWindow)

	authHandler := auth.NewHandler(
		authService,
		jwtManager,
		bootstrapToken,
		loginLimiter,
	)

	campaignRepository := campaign.NewRepository(db)
	campaignService := campaign.NewService(
		campaignRepository,
		blockchainRegistry,
		blockchainSigner,
	)
	campaignHandler := campaign.NewHandler(campaignService)

	donationRepository := donation.NewRepository(db)
	donationService := donation.NewService(
		donationRepository,
		campaignRepository,
		paillierPublicKey,
		paillierPrivateKey,
		zkVerifier,
		zkProver,
		blockchainRegistry,
		blockchainSigner,
	)
	donationHandler := donation.NewHandler(donationService)

	api := r.Group("/api")
	{
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST(
				"/register",
				auth.OptionalAuthMiddleware(jwtManager),
				authHandler.Register,
			)
			authRoutes.POST(
				"/login",
				auth.LoginRateLimitMiddleware(loginLimiter),
				authHandler.Login,
			)

			protected := authRoutes.Group("")
			protected.Use(auth.AuthMiddleware(jwtManager))
			{
				protected.GET("/me", authHandler.Me)
			}
		}

		campaignRoutes := api.Group("/campaigns")
		{
			campaignRoutes.GET("", campaignHandler.FindAll)
			campaignRoutes.GET(
				"/:id/donations",
				donationHandler.FindByCampaignID,
			)
			campaignRoutes.GET(
				"/:id/aggregate",
				donationHandler.GetCampaignAggregate,
			)
			campaignRoutes.GET("/:id", campaignHandler.FindByID)

			protectedCampaignRoutes := campaignRoutes.Group("")
			protectedCampaignRoutes.Use(
				auth.AuthMiddleware(jwtManager),
				auth.RequireRole(auth.RoleOrganizer, auth.RoleAdmin),
			)
			{
				protectedCampaignRoutes.POST("", campaignHandler.Create)
				protectedCampaignRoutes.PATCH("/:id", campaignHandler.Update)
			}
		}

		meRoutes := api.Group("/me")
		meRoutes.Use(auth.AuthMiddleware(jwtManager))
		{
			meRoutes.GET(
				"/donations",
				auth.RequireRole(auth.RoleDonor, auth.RoleAdmin),
				donationHandler.FindMine,
			)
			meRoutes.GET(
				"/organizer/donation-stats",
				auth.RequireRole(auth.RoleOrganizer, auth.RoleAdmin),
				donationHandler.OrganizerDonationStats,
			)
		}

		donationRoutes := api.Group("/donations")
		{
			donationRoutes.GET("/:id/verify", donationHandler.VerifyByID)
			donationRoutes.GET("/:id", donationHandler.FindByID)

			protectedDonationRoutes := donationRoutes.Group("")
			protectedDonationRoutes.Use(
				auth.AuthMiddleware(jwtManager),
				auth.RequireRole(auth.RoleDonor, auth.RoleAdmin),
			)
			{
				protectedDonationRoutes.POST("", donationHandler.Create)
				protectedDonationRoutes.POST(
					"/generate-proof",
					donationHandler.GenerateProof,
				)
				protectedDonationRoutes.POST(
					"/:id/retry",
					donationHandler.RetryFailed,
				)
			}
		}

		adminRoutes := api.Group("/admin")
		adminRoutes.Use(
			auth.AuthMiddleware(jwtManager),
			auth.RequireRole(auth.RoleAdmin),
		)
		{
			adminRoutes.GET(
				"/reconciliation/overview",
				donationHandler.AdminReconciliationOverview,
			)
			adminRoutes.GET(
				"/donations/archive",
				donationHandler.AdminListArchive,
			)
			adminRoutes.POST(
				"/campaigns/:id/reconcile-aggregate",
				donationHandler.AdminReconcileCampaignAggregate,
			)
			adminRoutes.POST(
				"/donations/reconcile-pending",
				donationHandler.AdminReconcilePending,
			)
		}
	}

	return r, donationService
}
