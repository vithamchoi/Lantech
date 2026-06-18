namespace SWD392.LantechEnglish.Application.DTOs.AI;

public class ChatMessageDto
{
    public string Role { get; set; } = null!; // "user" or "assistant" / "tutor"
    public string Content { get; set; } = null!;
}
