using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.DTOs.Users;

namespace SWD392.LantechEnglish.Application.DTOs.Dashboard;

public class DashboardDto
{
    public UserDto User { get; set; } = null!;
    public StudySummaryDto Summary { get; set; } = null!;
    public List<string> Weaknesses { get; set; } = new();
    public List<LessonDto> RecommendedNextLessons { get; set; } = new();
    public int DueFlashcardsCount { get; set; }
}
