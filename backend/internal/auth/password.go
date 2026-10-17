package auth

import (
	"errors"
	"unicode/utf8"

	"golang.org/x/crypto/bcrypt"
)

const (
	MinPasswordLength = 8
	MaxPasswordBytes  = 128
)

var (
	ErrPasswordTooShort = errors.New("password must be at least 8 characters")
	ErrPasswordTooLong  = errors.New("password is too long")

	// Hash untuk email yang tidak terdaftar — selalu jalankan bcrypt agar waktu respons serupa.
	dummyPasswordHash string
)

func init() {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte("trustgive-login-timing-mitigation"),
		bcrypt.DefaultCost,
	)
	if err != nil {
		panic("auth: failed to init dummy password hash: " + err.Error())
	}
	dummyPasswordHash = string(hash)
}

func ValidatePasswordPolicy(password string) error {
	if len(password) > MaxPasswordBytes {
		return ErrPasswordTooLong
	}
	if utf8.RuneCountInString(password) < MinPasswordLength {
		return ErrPasswordTooShort
	}
	return nil
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func CheckPassword(password, hash string) error {
	return bcrypt.CompareHashAndPassword(
		[]byte(hash),
		[]byte(password),
	)
}
