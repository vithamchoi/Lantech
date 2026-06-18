namespace SWD392.LantechEnglish.Application.DTOs.Health;

public class HealthStatusDto
{
    public bool DatabaseConnected { get; set; }
    public bool RedisConnected { get; set; }
    public string Status { get; set; } = "Healthy";
    public DateTime Timestamp { get; set; }
}
