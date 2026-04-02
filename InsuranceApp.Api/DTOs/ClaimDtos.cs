namespace InsuranceApp.Api.DTOs;

public record CreateClaimDto(
    string Description,
    decimal Amount,
    int PolicyId
);

public record UpdateClaimDto(
    string Description,
    decimal Amount,
    string Status
);

public record ClaimResponseDto(
    int Id,
    string Description,
    decimal Amount,
    string Status,
    DateTime ClaimDate,
    int PolicyId,
    string PolicyNumber
);
