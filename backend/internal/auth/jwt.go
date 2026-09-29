package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTManager struct {
	secret     string
	expiration time.Duration
}

func NewJWTManager(secret string, expiration time.Duration) *JWTManager {
	return &JWTManager{
		secret:     secret,
		expiration: expiration,
	}
}

func (m *JWTManager) GenerateToken(user *User) (string, error) {
	now := time.Now()

	claims := jwt.MapClaims{
		"sub":   user.ID.String(),
		"email": user.Email,
		"role":  user.Role,
		"iat":   now.Unix(),
		"exp":   now.Add(m.expiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(m.secret))
}

func ParseUserID(claims jwt.MapClaims) (uuid.UUID, error) {
	sub, err := claims.GetSubject()
	if err != nil {
		return uuid.Nil, err
	}

	return uuid.Parse(sub)
}
