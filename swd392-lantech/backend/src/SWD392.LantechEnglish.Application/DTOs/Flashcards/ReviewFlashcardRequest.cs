using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Flashcards;

public class ReviewFlashcardRequest
{
    [Required]
    [Range(0, 5, ErrorMessage = "Quality must be between 0 (complete blackout) and 5 (perfect response).")]
    public int Quality { get; set; }
}
