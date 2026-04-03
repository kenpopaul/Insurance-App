using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimService;

    public ClaimsController(IClaimService claimService)
    {
        _claimService = claimService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClaimResponseDto>>> GetAll()
    {
        var claims = await _claimService.GetAllAsync();
        return Ok(claims);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClaimResponseDto>> GetById(int id)
    {
        var claim = await _claimService.GetByIdAsync(id);
        if (claim == null)
            return NotFound(new { message = $"Claim {id} not found" });

        return Ok(claim);
    }

    [HttpGet("policy/{policyId}")]
    public async Task<ActionResult<IEnumerable<ClaimResponseDto>>> GetByPolicyId(int policyId)
    {
        var claims = await _claimService.GetByPolicyIdAsync(policyId);
        return Ok(claims);
    }

    [HttpPost]
    public async Task<ActionResult<ClaimResponseDto>> Create(CreateClaimDto dto)
    {
        var claim = await _claimService.CreateAsync(dto);
        if (claim == null)
            return BadRequest(new { message = "Policy not found" });

        return CreatedAtAction(nameof(GetById), new { id = claim.Id }, claim);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClaimResponseDto>> Update(int id, UpdateClaimDto dto)
    {
        var claim = await _claimService.UpdateAsync(id, dto);
        if (claim == null)
            return NotFound(new { message = $"Claim {id} not found" });

        return Ok(claim);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await _claimService.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Claim {id} not found" });

        return NoContent();
    }
}