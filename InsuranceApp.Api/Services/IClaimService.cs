using InsuranceApp.Api.DTOs;

namespace InsuranceApp.Api.Services;

public interface IClaimService
{
    Task<IEnumerable<ClaimResponseDto>> GetAllAsync();
    Task<IEnumerable<ClaimResponseDto>> GetByPolicyIdAsync(int policyId);
    Task<ClaimResponseDto?> GetByIdAsync(int id);
    Task<ClaimResponseDto?> CreateAsync(CreateClaimDto dto);
    Task<ClaimResponseDto?> UpdateAsync(int id, UpdateClaimDto dto);
    Task<bool> DeleteAsync(int id);
}