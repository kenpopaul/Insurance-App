using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Models;
using InsuranceApp.Api.Repositories;

namespace InsuranceApp.Api.Services;

public class PolicyService : IPolicyService
{
    private readonly IPolicyRepository _policyRepository;

    public PolicyService(IPolicyRepository policyRepository)
    {
        _policyRepository = policyRepository;
    }

    public async Task<IEnumerable<PolicyResponseDto>> GetAllAsync()
    {
        var policies = await _policyRepository.GetAllAsync();
        return policies.Select(MapToDto);
    }

    public async Task<IEnumerable<PolicyResponseDto>> GetByClientIdAsync(int clientId)
    {
        var policies = await _policyRepository.GetByClientIdAsync(clientId);
        return policies.Select(MapToDto);
    }

    public async Task<PolicyResponseDto?> GetByIdAsync(int id)
    {
        var policy = await _policyRepository.GetByIdAsync(id);
        return policy == null ? null : MapToDto(policy);
    }

    public async Task<PolicyResponseDto?> CreateAsync(CreatePolicyDto dto)
    {
        if (await _policyRepository.PolicyNumberExistsAsync(dto.PolicyNumber))
            return null;

        var policy = new Policy
        {
            PolicyNumber = dto.PolicyNumber,
            Type = dto.Type,
            Premium = dto.Premium,
            StartDate = dto.StartDate.ToUniversalTime(),
            EndDate = dto.EndDate.ToUniversalTime(),
            ClientId = dto.ClientId
        };

        var created = await _policyRepository.CreateAsync(policy);
        var withDetails = await _policyRepository.GetByIdAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task<PolicyResponseDto?> UpdateAsync(int id, UpdatePolicyDto dto)
    {
        var policy = await _policyRepository.GetByIdAsync(id);
        if (policy == null) return null;

        policy.PolicyNumber = dto.PolicyNumber;
        policy.Type = dto.Type;
        policy.Premium = dto.Premium;
        policy.StartDate = dto.StartDate.ToUniversalTime();
        policy.EndDate = dto.EndDate.ToUniversalTime();
        policy.IsActive = dto.IsActive;

        var updated = await _policyRepository.UpdateAsync(policy);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var policy = await _policyRepository.GetByIdAsync(id);
        if (policy == null) return false;

        await _policyRepository.DeleteAsync(policy);
        return true;
    }

    private static PolicyResponseDto MapToDto(Policy policy) =>
        new PolicyResponseDto(
            policy.Id,
            policy.PolicyNumber,
            policy.Type,
            policy.Premium,
            policy.StartDate,
            policy.EndDate,
            policy.IsActive,
            policy.CreatedAt,
            policy.ClientId,
            $"{policy.Client.FirstName} {policy.Client.LastName}",
            policy.Claims.Count
        );
}