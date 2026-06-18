using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Pronunciation;

public class PronunciationAttemptRequest
{
    [Required]
    public string TargetText { get; set; } = null!;
    
    [Required]
    public string AudioBase64 { get; set; } = null!;

    public Guid? ExerciseId { get; set; }
}
