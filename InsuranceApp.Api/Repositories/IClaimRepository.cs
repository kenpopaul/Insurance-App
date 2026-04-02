using InsuranceApp.Api.Models;

namespace InsuranceApp.Api.Repositories;

public interface IClaimRepository
{
    Task<IEnumerable<Claim>> GetAllAsync();
    Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId);
    Task<Claim?> GetByIdAsync(int id);
    Task<Claim> CreateAsync(Claim claim);
    Task<Claim> UpdateAsync(Claim claim);
    Task DeleteAsync(Claim claim);
}