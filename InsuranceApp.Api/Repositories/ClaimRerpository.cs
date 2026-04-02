using InsuranceApp.Api.Data;
using InsuranceApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InsuranceApp.Api.Repositories;

public class ClaimRepository : IClaimRepository
{
    private readonly AppDbContext _context;

    public ClaimRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Claim>> GetAllAsync()
    {
        return await _context.Claims
            .Include(c => c.Policy)
            .OrderByDescending(c => c.ClaimDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Claim>> GetByPolicyIdAsync(int policyId)
    {
        return await _context.Claims
            .Include(c => c.Policy)
            .Where(c => c.PolicyId == policyId)
            .OrderByDescending(c => c.ClaimDate)
            .ToListAsync();
    }

    public async Task<Claim?> GetByIdAsync(int id)
    {
        return await _context.Claims
            .Include(c => c.Policy)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Claim> CreateAsync(Claim claim)
    {
        _context.Claims.Add(claim);
        await _context.SaveChangesAsync();
        return claim;
    }

    public async Task<Claim> UpdateAsync(Claim claim)
    {
        _context.Claims.Update(claim);
        await _context.SaveChangesAsync();
        return claim;
    }

    public async Task DeleteAsync(Claim claim)
    {
        _context.Claims.Remove(claim);
        await _context.SaveChangesAsync();
    }
}