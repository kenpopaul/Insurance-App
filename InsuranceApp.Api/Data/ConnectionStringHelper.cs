namespace InsuranceApp.Api.Data;

public static class ConnectionStringHelper
{
    public static string? Normalize(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        var isUri = connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

        if (!isUri)
        {
            return connectionString;
        }

        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        var port = uri.Port == -1 ? 5432 : uri.Port;

        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
}
