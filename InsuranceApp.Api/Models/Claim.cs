namespace InsuranceApp.Api.Models;

public class Claim
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime ClaimDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int PolicyId { get; set; }
    public Policy Policy { get; set; } = null!;
}