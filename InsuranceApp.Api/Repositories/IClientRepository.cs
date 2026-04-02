using InsuranceApp.Api.Models;

namespace InsuranceApp.Api.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();
    Task<Client?> GetByIdAsync(int id);
    Task<Client> CreateAsync(Client client);
    Task<Client> UpdateAsync(Client client);
    Task DeleteAsync(Client client);
    Task<bool> EmailExistsAsync(string email);
}