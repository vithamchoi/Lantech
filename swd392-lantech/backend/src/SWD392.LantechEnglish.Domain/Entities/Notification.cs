using System;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string IconColor { get; set; } = string.Empty;
    public string IconBg { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation property
    public User? User { get; set; }
}
