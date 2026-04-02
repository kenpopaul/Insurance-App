using InsuranceApp.Api.Models;

namespace InsuranceApp.Api.Repositories;

public interface IPolicyRepository
{
    Task<IEnumerable<Policy>> GetAllAsync();
    Task<IEnumerable<Policy>> GetByClientIdAsync(int clientId);
    Task<Policy?> GetByIdAsync(int id);
    Task<Policy> CreateAsync(Policy policy);
    Task<Policy> UpdateAsync(Policy policy);
    Task DeleteAsync(Policy policy);
    Task<bool> PolicyNumberExistsAsync(string policyNumber);
}