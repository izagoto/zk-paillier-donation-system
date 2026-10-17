package auth

import "testing"

func TestValidatePasswordPolicy(t *testing.T) {
	if err := ValidatePasswordPolicy("short"); err != ErrPasswordTooShort {
		t.Fatalf("expected too short, got %v", err)
	}

	if err := ValidatePasswordPolicy("validpass"); err != nil {
		t.Fatalf("expected ok, got %v", err)
	}

	long := make([]byte, MaxPasswordBytes+1)
	for i := range long {
		long[i] = 'a'
	}
	if err := ValidatePasswordPolicy(string(long)); err != ErrPasswordTooLong {
		t.Fatalf("expected too long, got %v", err)
	}
}

func TestCheckPasswordUsesBcrypt(t *testing.T) {
	hash, err := HashPassword("secret123")
	if err != nil {
		t.Fatal(err)
	}
	if err := CheckPassword("secret123", hash); err != nil {
		t.Fatal(err)
	}
	if err := CheckPassword("wrong", hash); err == nil {
		t.Fatal("expected mismatch")
	}
}
