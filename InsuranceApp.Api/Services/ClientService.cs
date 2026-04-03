using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Models;
using InsuranceApp.Api.Repositories;

namespace InsuranceApp.Api.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync()
    {
        var clients = await _clientRepository.GetAllAsync();
        return clients.Select(MapToDto);
    }

    public async Task<ClientResponseDto?> GetByIdAsync(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        return client == null ? null : MapToDto(client);
    }

    public async Task<ClientResponseDto> CreateAsync(CreateClientDto dto)
    {
        var client = new Client
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            DateOfBirth = dto.DateOfBirth.ToUniversalTime()
        };

        var created = await _clientRepository.CreateAsync(client);
        return MapToDto(created);
    }

    public async Task<ClientResponseDto?> UpdateAsync(int id, UpdateClientDto dto)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null) return null;

        client.FirstName = dto.FirstName;
        client.LastName = dto.LastName;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Address = dto.Address;
        client.DateOfBirth = dto.DateOfBirth.ToUniversalTime();

        var updated = await _clientRepository.UpdateAsync(client);
        return MapToDto(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var client = await _clientRepository.GetByIdAsync(id);
        if (client == null) return false;

        await _clientRepository.DeleteAsync(client);
        return true;
    }

    private static ClientResponseDto MapToDto(Client client)
    {
        var totalClaims = client.Policies.Sum(p => p.Claims.Count);

        var riskLevel = totalClaims switch
        {
            0 => "Low",
            <= 2 => "Medium",
            <= 5 => "High",
            _ => "Critical"
        };

        return new ClientResponseDto(
            client.Id,
            client.FirstName,
            client.LastName,
            client.Email,
            client.Phone,
            client.Address,
            client.DateOfBirth,
            client.CreatedAt,
            client.Policies.Count,
            totalClaims,
            riskLevel
        );
    }
}