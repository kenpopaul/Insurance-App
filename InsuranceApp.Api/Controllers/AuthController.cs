using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        if (result == null)
            return BadRequest(new { message = "Email already exists" });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }
}