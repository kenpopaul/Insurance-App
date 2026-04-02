namespace InsuranceApp.Api.DTOs;

public record CreateClientDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    DateTime DateOfBirth
);

public record UpdateClientDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    DateTime DateOfBirth
);

public record ClientResponseDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Address,
    DateTime DateOfBirth,
    DateTime CreatedAt,
    int TotalPolicies,
    int TotalClaims,
    string RiskLevel
);