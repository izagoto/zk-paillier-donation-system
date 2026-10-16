package auth

import "errors"

const (
	RoleDonor     = "donor"
	RoleOrganizer = "organizer"
	RoleAuditor   = "auditor"
	RoleAdmin     = "admin"
)

var ErrInvalidRole = errors.New("invalid role")
var ErrForbidden = errors.New("forbidden")

func NormalizeRole(role string) (string, error) {
	switch role {
	case "", RoleDonor:
		return RoleDonor, nil
	case RoleOrganizer:
		return RoleOrganizer, nil
	case RoleAuditor:
		return RoleAuditor, nil
	case RoleAdmin:
		return RoleAdmin, nil
	default:
		return "", ErrInvalidRole
	}
}

func CanCreateCampaign(role string) bool {
	return role == RoleOrganizer || role == RoleAdmin
}

func CanDonate(role string) bool {
	return role == RoleDonor || role == RoleAdmin
}

func CanManageUsers(role string) bool {
	return role == RoleAdmin
}
