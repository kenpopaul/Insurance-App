using InsuranceApp.Api.DTOs;

namespace InsuranceApp.Api.Services;

public interface IPolicyService
{
    Task<IEnumerable<PolicyResponseDto>> GetAllAsync();
    Task<IEnumerable<PolicyResponseDto>> GetByClientIdAsync(int clientId);
    Task<PolicyResponseDto?> GetByIdAsync(int id);
    Task<PolicyResponseDto?> CreateAsync(CreatePolicyDto dto);
    Task<PolicyResponseDto?> UpdateAsync(int id, UpdatePolicyDto dto);
    Task<bool> DeleteAsync(int id);
}