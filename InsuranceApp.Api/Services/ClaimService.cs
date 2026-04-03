using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Models;
using InsuranceApp.Api.Repositories;

namespace InsuranceApp.Api.Services;

public class ClaimService : IClaimService
{
    private readonly IClaimRepository _claimRepository;
    private readonly IPolicyRepository _policyRepository;

    public ClaimService(IClaimRepository claimRepository, IPolicyRepository policyRepository)
    {
        _claimRepository = claimRepository;
        _policyRepository = policyRepository;
    }

    public async Task<IEnumerable<ClaimResponseDto>> GetAllAsync()
    {
        var claims = await _claimRepository.GetAllAsync();
        return claims.Select(MapToDto);
    }

    public async Task<IEnumerable<ClaimResponseDto>> GetByPolicyIdAsync(int policyId)
    {
        var claims = await _claimRepository.GetByPolicyIdAsync(policyId);
        return claims.Select(MapToDto);
    }

    public async Task<ClaimResponseDto?> GetByIdAsync(int id)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        return claim == null ? null : MapToDto(claim);
    }

    public async Task<ClaimResponseDto?> CreateAsync(CreateClaimDto dto)
    {
        var policy = await _policyRepository.GetByIdAsync(dto.PolicyId);
        if (policy == null) return null;

        var claim = new Claim
        {
            Description = dto.Description,
            Amount = dto.Amount,
            PolicyId = dto.PolicyId
        };

        var created = await _claimRepository.CreateAsync(claim);
        var withDetails = await _claimRepository.GetByIdAsync(created.Id);
        return MapToDto(withDetails!);
    }

    public async Task<ClaimResponseDto?> UpdateAsync(int id, UpdateClaimDto dto)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        if (claim == null) return null;

        claim.Description = dto.Description;
        claim.Amount = dto.Amount;
        claim.Status = dto.Status;

        var updated = await _claimRepository.UpdateAsync(claim);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var claim = await _claimRepository.GetByIdAsync(id);
        if (claim == null) return false;

        await _claimRepository.DeleteAsync(claim);
        return true;
    }

    private static ClaimResponseDto MapToDto(Claim claim) =>
        new ClaimResponseDto(
            claim.Id,
            claim.Description,
            claim.Amount,
            claim.Status,
            claim.ClaimDate,
            claim.PolicyId,
            claim.Policy.PolicyNumber
        );
}