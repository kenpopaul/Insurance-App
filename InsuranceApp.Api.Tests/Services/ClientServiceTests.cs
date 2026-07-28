using InsuranceApp.Api.DTOs;
using InsuranceApp.Api.Models;
using InsuranceApp.Api.Repositories;
using InsuranceApp.Api.Services;
using Moq;

namespace InsuranceApp.Api.Tests.Services;

/// <summary>
/// Boundary tests for the RiskLevel calculation in ClientService.MapToDto (private,
/// exercised indirectly through the public service methods):
///   0 claims => Low, 1-2 => Medium, 3-5 => High, 6+ => Critical.
/// Each boundary gets its own [Fact] rather than a [Theory]/[InlineData] table:
/// the test name itself documents which edge of the switch expression is being
/// pinned down (e.g. "upper boundary of Medium"), which is lost in a data row.
/// </summary>
public class ClientServiceTests
{
    private readonly Mock<IClientRepository> _clientRepositoryMock = new();
    private readonly ClientService _sut;

    public ClientServiceTests()
    {
        _sut = new ClientService(_clientRepositoryMock.Object);
    }

    // Builds a client with one policy per entry in claimsPerPolicy, each policy
    // holding that many claims. CreateClient(1) with no entries => zero policies.
    private static Client CreateClient(int id, params int[] claimsPerPolicy)
    {
        var client = new Client
        {
            Id = id,
            FirstName = "Test",
            LastName = "Client",
            Email = $"client{id}@example.com",
            Phone = "555-0100",
            Address = "123 Main St",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            CreatedAt = DateTime.UtcNow
        };

        foreach (var claimCount in claimsPerPolicy)
        {
            var policy = new Policy
            {
                Id = client.Policies.Count + 1,
                PolicyNumber = $"POL-{client.Policies.Count + 1}",
                Type = "Auto",
                Premium = 100m,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(1),
                ClientId = id,
                Client = client
            };

            for (var i = 0; i < claimCount; i++)
            {
                policy.Claims.Add(new Claim
                {
                    Id = policy.Claims.Count + 1,
                    Description = "Test claim",
                    Amount = 500m,
                    PolicyId = policy.Id,
                    Policy = policy
                });
            }

            client.Policies.Add(policy);
        }

        return client;
    }

    [Fact]
    public async Task GetByIdAsync_ZeroClaims_ReturnsLowRiskLevel()
    {
        // Arrange
        var client = CreateClient(1, 0);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalClaims);
        Assert.Equal("Low", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_OneClaim_ReturnsMediumRiskLevel()
    {
        // Arrange
        var client = CreateClient(1, 1);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalClaims);
        Assert.Equal("Medium", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_TwoClaims_ReturnsMediumRiskLevel_UpperBoundary()
    {
        // Arrange
        var client = CreateClient(1, 2);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalClaims);
        Assert.Equal("Medium", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_ThreeClaims_ReturnsHighRiskLevel_LowerBoundary()
    {
        // Arrange
        var client = CreateClient(1, 3);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalClaims);
        Assert.Equal("High", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_FiveClaims_ReturnsHighRiskLevel_UpperBoundary()
    {
        // Arrange
        var client = CreateClient(1, 5);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(5, result.TotalClaims);
        Assert.Equal("High", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_SixClaims_ReturnsCriticalRiskLevel_LowerBoundary()
    {
        // Arrange
        var client = CreateClient(1, 6);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(6, result.TotalClaims);
        Assert.Equal("Critical", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_ClaimsSpreadAcrossMultiplePolicies_SumToCriticalRiskLevel()
    {
        // Arrange: two policies, three claims each => 6 total claims => Critical
        var client = CreateClient(1, 3, 3);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalPolicies);
        Assert.Equal(6, result.TotalClaims);
        Assert.Equal("Critical", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_PoliciesWithNoClaims_ReturnsLowRiskLevel()
    {
        // Arrange: three policies, none with any claims
        var client = CreateClient(1, 0, 0, 0);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalPolicies);
        Assert.Equal(0, result.TotalClaims);
        Assert.Equal("Low", result.RiskLevel);
    }

    [Fact]
    public async Task GetByIdAsync_NoPolicies_ReturnsLowRiskLevelAndZeroTotalClaims()
    {
        // Arrange
        var client = CreateClient(1);
        _clientRepositoryMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(client);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalPolicies);
        Assert.Equal(0, result.TotalClaims);
        Assert.Equal("Low", result.RiskLevel);
    }

    [Fact]
    public async Task GetAllAsync_MapsRiskLevelIndependentlyForEachClient()
    {
        // Arrange: one client with no claims, one client at the Critical boundary
        var lowRiskClient = CreateClient(1);
        var criticalRiskClient = CreateClient(2, 6);
        _clientRepositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(new[] { lowRiskClient, criticalRiskClient });

        // Act
        var result = (await _sut.GetAllAsync()).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Low", result[0].RiskLevel);
        Assert.Equal("Critical", result[1].RiskLevel);
    }

    [Fact]
    public async Task CreateAsync_NewClientHasNoPoliciesYet_ReturnsLowRiskLevel()
    {
        // Arrange: a freshly created client has no policies/claims at all
        var dto = new CreateClientDto(
            "Jane", "Doe", "jane.doe@example.com", "555-0199", "456 Oak Ave", new DateTime(1985, 5, 20));
        _clientRepositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<Client>()))
            .ReturnsAsync((Client c) =>
            {
                c.Id = 42;
                return c;
            });

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.Equal(0, result.TotalPolicies);
        Assert.Equal(0, result.TotalClaims);
        Assert.Equal("Low", result.RiskLevel);
    }
}
