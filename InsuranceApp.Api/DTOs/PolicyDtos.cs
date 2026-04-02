namespace InsuranceApp.Api.DTOs;

public record CreatePolicyDto(
    string PolicyNumber,
    string Type,
    decimal Premium,
    DateTime StartDate,
    DateTime EndDate,
    int ClientId
);

public record UpdatePolicyDto(
    string PolicyNumber,
    string Type,
    decimal Premium,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive
);

public record PolicyResponseDto(
    int Id,
    string PolicyNumber,
    string Type,
    decimal Premium,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    DateTime CreatedAt,
    int ClientId,
    string ClientName,
    int ClaimCount
);
