using InsuranceApp.Api.Data;
using InsuranceApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InsuranceApp.Api.Repositories;

public class PolicyRepository : IPolicyRepository
{
    private readonly AppDbContext _context;

    public PolicyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Policy>> GetAllAsync()
    {
        return await _context.Policies
            .Include(p => p.Client)
            .Include(p => p.Claims)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Policy>> GetByClientIdAsync(int clientId)
    {
        return await _context.Policies
            .Include(p => p.Client)
            .Include(p => p.Claims)
            .Where(p => p.ClientId == clientId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Policy?> GetByIdAsync(int id)
    {
        return await _context.Policies
            .Include(p => p.Client)
            .Include(p => p.Claims)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Policy> CreateAsync(Policy policy)
    {
        _context.Policies.Add(policy);
        await _context.SaveChangesAsync();
        return policy;
    }

    public async Task<Policy> UpdateAsync(Policy policy)
    {
        _context.Policies.Update(policy);
        await _context.SaveChangesAsync();
        return policy;
    }

    public async Task DeleteAsync(Policy policy)
    {
        _context.Policies.Remove(policy);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> PolicyNumberExistsAsync(string policyNumber)
    {
        return await _context.Policies.AnyAsync(p => p.PolicyNumber == policyNumber);
    }
}