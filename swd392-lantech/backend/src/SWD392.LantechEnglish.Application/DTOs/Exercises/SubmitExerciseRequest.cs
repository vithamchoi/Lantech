using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Exercises;

public class SubmitExerciseRequest
{
    [Required]
    public string Answer { get; set; } = null!;
}
