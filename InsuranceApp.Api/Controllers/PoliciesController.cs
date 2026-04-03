using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PoliciesController : ControllerBase
{
    private readonly IPolicyService _policyService;

    public PoliciesController(IPolicyService policyService)
    {
        _policyService = policyService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PolicyResponseDto>>> GetAll()
    {
        var policies = await _policyService.GetAllAsync();
        return Ok(policies);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PolicyResponseDto>> GetById(int id)
    {
        var policy = await _policyService.GetByIdAsync(id);
        if (policy == null)
            return NotFound(new { message = $"Policy {id} not found" });

        return Ok(policy);
    }

    [HttpGet("client/{clientId}")]
    public async Task<ActionResult<IEnumerable<PolicyResponseDto>>> GetByClientId(int clientId)
    {
        var policies = await _policyService.GetByClientIdAsync(clientId);
        return Ok(policies);
    }

    [HttpPost]
    public async Task<ActionResult<PolicyResponseDto>> Create(CreatePolicyDto dto)
    {
        var policy = await _policyService.CreateAsync(dto);
        if (policy == null)
            return BadRequest(new { message = "Policy number already exists" });

        return CreatedAtAction(nameof(GetById), new { id = policy.Id }, policy);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PolicyResponseDto>> Update(int id, UpdatePolicyDto dto)
    {
        var policy = await _policyService.UpdateAsync(id, dto);
        if (policy == null)
            return NotFound(new { message = $"Policy {id} not found" });

        return Ok(policy);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var success = await _policyService.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Policy {id} not found" });

        return NoContent();
    }
}